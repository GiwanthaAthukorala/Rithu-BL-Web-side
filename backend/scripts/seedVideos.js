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
    videoUrl: "https://youtube.com/shorts/qRrC3-yoCTg?si=dnAmty0A0E38jLYU",
    embedUrl: "https://youtube.com/shorts/qRrC3-yoCTg?si=dnAmty0A0E38jLYU",
    thumbnailUrl: "https://i.ytimg.com/vi/zBjJUV-lzHo/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Business Growth Strategies",
    description: "Learn effective business growth techniques.",
    videoUrl: "https://youtube.com/shorts/w5TMnyrfKAY?si=V77IqydMismlIyzJ",
    embedUrl: "https://youtube.com/shorts/w5TMnyrfKAY?si=V77IqydMismlIyzJ",
    thumbnailUrl:
      "https://images.pexels.com/photos/669996/pexels-photo-669996.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop",
    platform: "custom",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  /*{
    title: "Motivational Success Story",
    description: "Inspirational story about achieving business success.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    embedUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    platform: "custom",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Technology Innovation",
    description: "Latest trends in technology and innovation.",
    videoUrl:
      "https://videos.pexels.com/video-files/855565/855565-hd_1920_1080_25fps.mp4",
    embedUrl:
      "https://videos.pexels.com/video-files/855565/855565-hd_1920_1080_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop",
    platform: "custom",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Creative Design Process",
    description: "Learn about creative design thinking and process.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
    embedUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    platform: "custom",
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
