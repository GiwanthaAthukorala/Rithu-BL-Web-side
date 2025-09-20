require("dotenv").config(); // Add this line at the top
const mongoose = require("mongoose");
const Link = require("../models/Link");

// Create a direct connection function for the seed script
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const facebookLinks = [
  {
    url: "https://www.facebook.com/share/1B11xkbvxB/",
    title: "Minu Anthurium - පෙජ් එක ෆලො (Follow ) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61553480813114&mibextid=ZbWKwL",
    title: "Gem Gild of Ceylon - පෙජ් එක ලයික් (Like) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1G51CGDPBs/?mibextid=wwXIfr",
    title: "English with Gihan Kanishka - පෙජ් එක ලයික් (Like) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1ARA89E5H1/",
    title: "Cylora Fashion - පෙජ් එක ලයික් (Like) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
];
async function seedLinks() {
  try {
    await connectDB();

    await Link.deleteMany({ platform: "facebook" });
    console.log("Cleared existing Facebook links");

    for (const linkData of facebookLinks) {
      await Link.create(linkData);
      console.log(`Added link: ${linkData.title}`);
    }

    console.log("Links seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedLinks();
