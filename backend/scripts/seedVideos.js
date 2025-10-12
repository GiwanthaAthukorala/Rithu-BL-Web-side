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
    title: "Digital Marketing Masterclass",
    description:
      "Learn advanced digital marketing strategies. Watch for 1 minute to earn Rs 1.",
    videoUrl: "https://www.youtube.com/watch?v=zBjJUV-lzHo",
    embedUrl: "https://www.youtube.com/embed/zBjJUV-lzHo?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/zBjJUV-lzHo/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Facebook Business Growth Tips",
    description: "Grow your business using Facebook marketing techniques.",
    videoUrl: "https://www.facebook.com/share/r/1JrpBLh7av/",
    embedUrl: "https://www.facebook.com/share/r/1JrpBLh7av/", // Facebook doesn't allow embedding
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
    platform: "facebook",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  /*{
    title: "Instagram Content Creation",
    description: "Create engaging content for Instagram platform.",
    videoUrl: "https://www.instagram.com/reel/CrYKenNveYh/",
    embedUrl: "", // Instagram doesn't allow embedding
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=225&fit=crop",
    platform: "instagram",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "TikTok Viral Strategies",
    description: "Learn how to create viral content on TikTok.",
    videoUrl: "https://www.tiktok.com/@example/video/1234567890123456789",
    embedUrl: "", // TikTok doesn't allow embedding
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=225&fit=crop",
    platform: "tiktok",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Morning Yoga Routine",
    description: "Start your day with this peaceful yoga session.",
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    embedUrl: "https://www.youtube.com/embed/ml6cT4AZdqI?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/ml6cT4AZdqI/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },*/
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
