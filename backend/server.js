require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

// Validate critical environment variables
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
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://rithu-business-client-side-6pnc.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

// Import routes
const routes = [
  require("./routes/userRoutes"),
  require("./routes/submissions"),
  require("./routes/earnings"),
  require("./routes/adminRoutes"),
];

// Register routes
routes.forEach((route) => {
  app.use("/api", route);
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.status(200).json({
      status: "ok",
      database: dbStatus,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Vercel serverless compatibility
if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    try {
      await connectDB();
      return app(req, res);
    } catch (error) {
      console.error("Serverless function error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
} else {
  startServer();
}
