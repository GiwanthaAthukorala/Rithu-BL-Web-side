const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB connection URI is not defined");
    }

    console.log("Attempting to connect to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Full error:", error);
    throw error; // Rethrow to ensure the error is visible
  }
};

// Serverless function cleanup
if (process.env.VERCEL) {
  process.on("SIGTERM", async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed gracefully");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
    process.exit(0);
  });
}

module.exports = connectDB;
