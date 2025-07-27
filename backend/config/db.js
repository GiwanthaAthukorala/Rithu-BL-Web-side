const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: "majority",
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

// Prevent premature closing in serverless
if (!process.env.VERCEL) {
  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed gracefully");
    process.exit(0);
  });
}

module.exports = connectDB;
