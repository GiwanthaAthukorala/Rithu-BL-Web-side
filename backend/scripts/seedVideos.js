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
    title: "Healthy Cooking Techniques",
    description: "Master easy cooking methods for healthy living.",
    videoUrl: "https://www.youtube.com/embed/EzR_2uvEC0E?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/EzR_2uvEC0E/hqdefault.jpg",
    platform: "youtube",
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
  {
    title: "Yoga for Beginners",
    description: "Relax and stretch with basic yoga poses.",
    videoUrl: "https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/v7AYKMP6rOE/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Meditation Guide",
    description: "Learn meditation techniques for stress relief.",
    videoUrl: "https://www.youtube.com/embed/inpok4MKVLM?autoplay=1",
    thumbnailUrl: "https://i.ytimg.com/vi/inpok4MKVLM/hqdefault.jpg",
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
