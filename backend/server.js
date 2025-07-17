const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

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

// CORS middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://rithu-business-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something Broke!!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}
  MongoDB:${process.env.MONGO_URI}
  Frontend:${process.env.FRONTEND_URL}`)
);
