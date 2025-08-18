require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const cloudinary = require("./utils/cloudinary");

const connectDB = require("./config/db");
const app = express(); // ✅ Now declared before it's used
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

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Handle preflight requests
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

  // Handle regular requests
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Auth header:", req.headers.authorization);
  next();
});

// === Routes ===
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/youtubeSubmissions", require("./routes/youtubeRoutes"));
app.use("/api/auth", require("./routes/passwordResetRoutes"));

// === Health Check ===
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ Move this route **AFTER** app is initialized
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
  res.status(200).json({ message: "Backend is running!" });
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

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// === Export Handler for Vercel or Start Server Locally ===
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO path: /socket.io`);
  });
}
