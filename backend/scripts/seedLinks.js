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
    url: "https://www.facebook.com/share/v/1VMTkCAtAn/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/14JMwaMUS4k/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/1EruyA1Ud7/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1Y41H1Ta1L/",
    title: "Ayurvee Herbal - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61577843314744",
    title: "Blooms Bell - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16ucsqbY8q/?mibextid=wwXIfr",
    title:
      "Yasara Dinithi Beauty Hair Acadamy  - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/14N2PE5vGu5/",
    title:
      "Ritigala Hair oil රිටිගල හෙයා ඔයිල් - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
