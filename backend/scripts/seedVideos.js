require("dotenv").config();
const mongoose = require("mongoose");
const Video = require("../models/Video");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Fixed video links with proper embed URLs
const sampleVideos = [
  {
    title: "Motivational Workout Video",
    description:
      "Get motivated with this intense workout session. Watch for 1 minute to earn Rs 1.",
    videoUrl: "https://www.youtube.com/shorts/qRrC3-yoCTg",
    embedUrl: "https://youtube.com/shorts/w5TMnyrfKAY?si=V77IqydMismlIyzJ",
    thumbnailUrl: "https://i.ytimg.com/vi/UBMk30rjy0o/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
    maxViews: 1000,
    currentViews: 0,
    category: "fitness",
    tags: ["workout", "motivation", "fitness"],
    targetAudience: "all",
  },
  {
    title: "Quick Home Exercise",
    description:
      "Perfect quick home workout for busy people. Watch for 1 minute to earn Rs 1.",
    videoUrl: "https://youtube.com/shorts/w5TMnyrfKAY?si=V77IqydMismlIyzJ",
    embedUrl: "https://youtube.com/shorts/w5TMnyrfKAY?si=V77IqydMismlIyzJ",
    thumbnailUrl: "https://i.ytimg.com/vi/ml6cT4AZdqI/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
    maxViews: 1000,
    currentViews: 0,
    category: "fitness",
    tags: ["home workout", "quick", "exercise"],
    targetAudience: "all",
  },
];

const seedVideos = async () => {
  try {
    await connectDB();

    // Clear existing videos
    await Video.deleteMany({});
    console.log("Cleared existing videos");

    // Insert sample videos
    const result = await Video.insertMany(sampleVideos);
    console.log(`Successfully created ${result.length} sample videos`);

    // Display the created videos
    const createdVideos = await Video.find({});
    console.log("\nCreated Videos:");
    createdVideos.forEach((video) => {
      console.log(
        `- ${video.title} (${video.platform}) - ${video.duration}s - Rs ${video.rewardAmount}`
      );
    });

    console.log("\nSeeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding videos:", error);
    process.exit(1);
  }
};

// Handle script termination
process.on("SIGINT", async () => {
  console.log("\nSeeding interrupted");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nSeeding terminated");
  await mongoose.connection.close();
  process.exit(0);
});

seedVideos();
