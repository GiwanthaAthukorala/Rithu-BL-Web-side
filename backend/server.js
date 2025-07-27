require("dotenv").config(); // Load environment variables first

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Verify critical environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://rithu-business-client-side-6pnc.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
});

// Middleware
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

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

// Health check
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal server error" });
});

// Start server
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

// Vercel serverless function handler
if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
}
