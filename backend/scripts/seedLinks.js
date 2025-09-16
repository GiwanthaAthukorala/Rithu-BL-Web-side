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
    url: "https://www.facebook.com/share/1WGHN8QW1x/?mibextid=wwXIfr",
    title: "€ • N • F Brand - පෙජ් එක ලයික් (Like) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/p/1PN9D8unQo/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1CHDtYm9oU/",
    title: "OLASH Beauty Hub - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17Pd71ySzA/",
    title: "Bike sale  - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16zcRxNTai/",
    title: "Delonix Creations - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16z1MR7146/",
    title: "Dye Bath - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/v/1T31N9Gd6L/?mibextid=wwXIfr",
    title: "විඩියො පොස්ට් ලයික් (Like) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/196YRZrXw7/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/19mB5Z6W6P/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/1GGwCV4cAy/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1AYStumVNd/",
    title: "GS sandaruwan piyathissa Photography - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1BbCfgmjys/?mibextid=wwXIfr",
    title: "Royal whitening - පෙජ් එක ෆලො(Follow) කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61563999916386",
    title: "Madhu&Ishara - පෙජ් එකට  ෆලො(Follow) කරන්න  ",
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
