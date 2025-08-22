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
    url: "https://www.facebook.com/share/15wvA1t4jG/?mibextid=wwXIfr",
    title: "Option4 Software Solutions - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1C1Refeowf",
    title: "Madushan Abeysinghe - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/v/17Dgc4chF8/?mibextid=wwXIfr",
    title: "පොස්ට් එක සෙයා කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/v/1WJPzPTfyT/?mibextid=wwXIfr",
    title: "පොස්ට් එක සෙයා කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/19WRYP4wgs/",
    title: "Indhu salon & Photography - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/1A4dxsYsmM/",
    title: "RaaVo Live Music Band - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1CGcR2x2n1/",
    title: "Science - Supun Rathnayaka - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
