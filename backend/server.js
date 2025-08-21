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

// === MongoDB Connection === FIRST!
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
  process.exit(1);
});

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

// === Middleware ===
const allowedOrigins = [
  "https://rithu-business-client-side-2131.vercel.app",
  "http://localhost:3000", // Add for local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Body:", req.body);
  next();
});

// === Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/youtubeSubmissions", require("./routes/youtubeRoutes"));
app.use("/api/auth", require("./routes/passwordResetRoutes"));
app.use("/api/links", require("./routes/linkRoutes"));
app.use("/api/fb-reviews", require("./routes/ReviewRoutes"));

// === Health Check ===
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", database: "connected" });
});

// Cloudinary test route
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

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// === Error Handling ===
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "MongoError" && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// === Export Handler for Vercel or Start Server Locally ===
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Socket.IO path: /socket.io`);
  });
}
