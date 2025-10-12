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
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const sampleVideos = [
  {
    title: "Digital Marketing Tips",
    description:
      "Learn essential digital marketing strategies. Watch for 1 minute to earn Rs 1.",
    videoUrl: "https://www.youtube.com/embed/zBjJUV-lzHo?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/zBjJUV-lzHo/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Facebook Business Tutorial",
    description: "Learn how to grow your business on Facebook.",
    videoUrl:
      "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=0&width=560",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", // Fallback thumbnail
    platform: "facebook",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Instagram Reels Tips",
    description: "Create engaging Instagram Reels content.",
    videoUrl: "https://www.instagram.com/p/CrYKenNveYh/embed/",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", // Fallback thumbnail
    platform: "instagram",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "TikTok Viral Trends",
    description: "Learn the latest TikTok trends and techniques.",
    videoUrl: "https://www.tiktok.com/embed/v2/7156741793881197866",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", // Fallback thumbnail
    platform: "tiktok",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Morning Exercise Routine",
    description: "Start your day with this energizing workout.",
    videoUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/ml6cT4AZdqI/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
];

const seedVideos = async () => {
  try {
    await connectDB();

    // Clear existing videos
    await Video.deleteMany({});
    console.log("Cleared existing videos");

    // Insert sample videos
    await Video.insertMany(sampleVideos);
    console.log(`Successfully created ${sampleVideos.length} sample videos`);

    // Display the created videos
    const createdVideos = await Video.find({});
    console.log("\nCreated Videos:");
    createdVideos.forEach((video) => {
      console.log(
        `- ${video.title} (${video.platform}) - ${video.duration}s - Rs ${video.rewardAmount}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding videos:", error);
    process.exit(1);
  }
};

seedVideos();
