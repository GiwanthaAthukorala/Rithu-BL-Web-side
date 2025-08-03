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

// --- Option 1: Using cors package with dynamic whitelist ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://rithu-business-client-side-2131.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed for this domain: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));

// --- Option 2: Alternatively, set headers manually ---
// Uncomment the following middleware block if you prefer to set CORS headers manually:

/*
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://rithu-business-client-side-2131.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
*/

// ----- Socket.IO Configuration -----
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

// ----- MongoDB Connection -----
connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
});

// ----- Other Middlewares -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Auth header:", req.headers.authorization);
  next();
});

// ----- Routes -----
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Test route for Cloudinary resources
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

// ----- Error Handling Middleware -----
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

// ----- Start Server or Export for Serverless Platforms -----
if (process.env.VERCEL) {
  // When deploying on Vercel, export the app for serverless functions
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO path: /socket.io`);
  });
}
