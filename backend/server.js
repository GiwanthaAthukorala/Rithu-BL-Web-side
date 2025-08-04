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

// === Enhanced MongoDB Connection ===
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
  process.exit(1); // Exit if DB connection fails
});

// === CORS Configuration ===
const allowedOrigins = [
  "https://rithu-business-client-side-2131.vercel.app",
  "http://localhost:3000",
];

// Middleware to handle CORS properly
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// === Socket.IO Configuration ===
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  },
});

// ... rest of your Socket.IO setup ...

// === Body Parsers ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// === Request Logging ===
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// === Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/admin", require("./routes/adminRoutes"));

// === Health Check ===
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    dbState: mongoose.connection.readyState,
    memoryUsage: process.memoryUsage(),
  });
});

// === Error Handling ===
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle MongoDB timeout errors
  if (err.message.includes("buffering timed out")) {
    return res.status(503).json({
      success: false,
      message: "Database operation timed out. Please try again.",
    });
  }

  // Handle other errors...
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
