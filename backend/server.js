require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const cloudinary = require("./utils/cloudinary");

// Import routes
const userRoutes = require("./routes/userRoutes");
// add other route requires below as needed
// const submissionsRoutes = require("./routes/submissions");

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// CORS - allow your frontend origin and allow no-origin (curl/postman)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://rithu-business-client-side-2131.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Socket.IO - use polling transport for Vercel compatibility
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling"], // IMPORTANT: polling only works on serverless like Vercel
  path: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    if (userId) socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.set("io", io);

// Routes
app.use("/api/users", userRoutes);
// mount other routes here, e.g. app.use("/api/submissions", submissionsRoutes);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/", (req, res) => res.json({ message: "Backend is running!" }));

// Example Cloudinary test route
app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "submissions",
      max_results: 20,
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error("Cloudinary Test Error:", err.message || err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Cloudinary error" });
  }
});

// Error handlers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// Export for Vercel or start local server
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Socket.IO path:", "/socket.io");
  });
}
