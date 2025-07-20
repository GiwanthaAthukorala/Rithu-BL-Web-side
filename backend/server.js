require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");

// Initialize Express app
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
  })
);
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions")); // Changed from submissions.js to submissionRoutes.js
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO path: /socket.io`);
});
