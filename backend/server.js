require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

// Import configurations and utilities
const connectDB = require("./config/db");
const cloudinary = require("./utils/cloudinary");

const app = express();
const httpServer = createServer(app);

// === CORS Configuration (Simplified) ===
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL ||
      "https://rithu-business-client-side-2131.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// === Socket.IO Configuration (Conditional for Vercel) ===
let io;
if (!process.env.VERCEL) {
  io = new Server(httpServer, {
    cors: corsOptions,
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
} else {
  // Mock io for Vercel environment
  app.set("io", {
    to: () => ({ emit: () => {} }),
    emit: () => {},
  });
}

// === MongoDB Connection with Better Error Handling ===
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    await connectDB();
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    // Don't exit process in serverless environment
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Connect to database
connectToDatabase();

// === Middleware ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// === Health Check (Must come before routes) ===
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? "connected" : "disconnected",
  });
});

// === API Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/youtubeSubmissions", require("./routes/youtubeRoutes"));
app.use("/api/auth", require("./routes/passwordResetRoutes"));
app.use("/api/links", require("./routes/linkRoutes"));
app.use("/api/review-links", require("./routes/ReviewLink"));
app.use("/api/fb-reviews", require("./routes/ReviewRoutes"));

// === Cloudinary Test Route ===
app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "submissions",
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Cloudinary Test Failed:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? "production" : "development",
  });
});

// === Catch-all for API routes ===
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.path} not found`,
  });
});

// === Error Handling Middleware ===
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle specific error types
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "MongoError" || err.name === "MongooseError") {
    return res.status(500).json({
      success: false,
      message: "Database error occurred",
    });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// === Handle 404 for non-API routes ===
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// === Export for Vercel or Start Server Locally ===
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO path: /socket.io`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}
