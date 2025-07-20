const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
//const userRoutes = require("./routes/userRoutes");
//const submissionsRouter = require("./routes/submissions");
//const earningsRoutes = require("./routes/earnings");
const fileUpload = require("express-fileupload");
const { createServer } = require("http");
const { Server } = require("socket.io");
// Load env vars
dotenv.config();

// Verify required environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Connect to database
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});
// Socket.io for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// CORS middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-file-name"],
  })
);

app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

// Test endpoint
app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Handle OPTIONS requests
app.options("*", cors());

// Body parser
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/earnings", require("./routes/earnings"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something Broke!!" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB: ${process.env.MONGO_URI}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL}`);
});
