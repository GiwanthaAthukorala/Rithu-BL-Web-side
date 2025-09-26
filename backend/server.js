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
const httpServer = createServer(app);

// === Socket.IO Configuration ===
const io = new Server(httpServer, {
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

// === MongoDB Connection ===
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
});

// === Middleware ===
const allowedOrigins = ["https://rithu-business-client-side-2131.vercel.app"];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", origin || allowedOrigins[0]);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    return res.status(200).end();
  }

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// === Favicon Route ===
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
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
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
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
  });
});

// === 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

// === Error Handling ===
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);

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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// === Export Handler for Vercel or Start Server Locally ===
const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO path: /socket.io`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
  });
}
