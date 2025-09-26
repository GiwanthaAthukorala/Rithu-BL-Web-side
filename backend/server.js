// Suppress warnings
process.removeAllListeners("warning");

require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const cloudinary = require("./utils/cloudinary");

const connectDB = require("./config/db");
const app = express();

// === Vercel Serverless Fix ===
let httpServer;
let io;

// Only create HTTP server and Socket.IO if not in Vercel environment
if (!process.env.VERCEL) {
  httpServer = createServer(app);

  // === Socket.IO Configuration ===
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        "https://rithu-business-client-side-2131.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    path: "/socket.io",
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("register", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} registered for updates`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  app.set("io", io);
}

// === MongoDB Connection ===
// Only connect to MongoDB if not in Vercel environment
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error("Database connection failed:", err.message);
  });
}

// === Middleware ===
const allowedOrigins = [
  "https://rithu-business-client-side-2131.vercel.app",
  "http://localhost:3000",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers for all responses
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS,PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// === Favicon Route ===
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// === Database Connection Middleware ===
app.use(async (req, res, next) => {
  try {
    // For Vercel serverless, connect to DB on each request
    if (process.env.VERCEL) {
      if (mongoose.connection.readyState === 0) {
        await connectDB();
      }
    }
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    next(error);
  }
});

// === Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/youtubeSubmissions", require("./routes/youtubeRoutes"));
app.use("/api/auth", require("./routes/passwordResetRoutes"));
app.use("/api/links", require("./routes/linkRoutes"));
app.use("/api/review-links", require("./routes/ReviewLink"));
app.use("/api/fb-reviews", require("./routes/ReviewRoutes"));
app.use("/api/fb-comments", require("./routes/CommentRoutes"));
app.use("/api/googlereviews", require("./routes/GoogleReviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// === Health Check ===
app.get("/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// === Cloudinary Test Route ===
app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "submissions",
      max_results: 10,
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Cloudinary Test Failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// === Root Route ===
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    platform: process.env.VERCEL ? "Vercel Serverless" : "Traditional Server",
  });
});

// === 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    availableEndpoints: [
      "/health",
      "/api/users",
      "/api/submissions",
      "/api/admin",
    ],
  });
});

// === Error Handling ===
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  // Specific error handlers
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ success: false, message: "CORS policy violation" });
  }

  // MongoDB connection error
  if (err.name === "MongoNetworkError") {
    return res
      .status(503)
      .json({ success: false, message: "Database connection failed" });
  }

  // Default error handler
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// === Export Handler for Vercel or Start Server Locally ===
const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  // Export for Vercel serverless
  module.exports = app;
} else {
  // Start traditional server for local development
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO path: /socket.io`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
  });
}
