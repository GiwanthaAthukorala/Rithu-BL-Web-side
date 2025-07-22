require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
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

// Connect to database
connectDB().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Import routes properly
const userRoutes = require("./routes/userRoutes");
const submissionsRoutes = require("./routes/submissions");
const earningsRoutes = require("./routes/earnings");
const adminRoutes = require("./routes/adminRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO path: /socket.io`);
});
