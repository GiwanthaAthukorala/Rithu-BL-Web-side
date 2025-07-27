const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Handle serverless function cleanup
if (process.env.VERCEL) {
  process.on("SIGTERM", () => {
    mongoose.connection.close(() => {
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  });
}

module.exports = connectDB;
