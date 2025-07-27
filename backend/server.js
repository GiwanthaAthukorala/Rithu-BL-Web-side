// Load environment variables FIRST
require("dotenv").config();
console.log("Environment:", process.env.NODE_ENV);
console.log("MongoDB URI:", process.env.MONGO_URI ? "*****" : "MISSING!");

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Verify critical environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`CRITICAL: Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "https://rithu-business-client-side-6pnc-90zsbcwfv.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  path: "/socket.io",
});

// Socket.IO connection handler
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

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require("./routes/userRoutes");
const submissionsRoutes = require("./routes/submissions");
const earningsRoutes = require("./routes/earnings");
const adminRoutes = require("./routes/adminRoutes");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/admin", adminRoutes);

// Enhanced health check
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    db: dbStatus,
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Vercel serverless function handler
if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
}
