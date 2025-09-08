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
    title: "Minu Anthurium - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/dayzimports?mibextid=LQQJ4d",
    title: "Ruhara MotorsDayZ Imports - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1C6xTWNqXj/",
    title: "Ruhara Motors - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1DZYRtdfLr/?mibextid=wwXIfr",
    title: "MP Mobile - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61577159349135&mibextid=ZbWKwL",
    title: "සනූ Craft - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16twPj93fx/?mibextid=wwXIfr",
    title: "JP Deriv Trading Community - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/1Hmwqcfc3v/",
    title: "Dekora - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/giwanthaathukorala46",
    title: "Ʀᴇᴍᴇᴍʙᴇʀ - මතකයන් シ︎ - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1Pveq4M4Hz/",
    title: "Skinova Store - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/161avLQaPY/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1CskB7ahKu/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/17PWvp6jzo/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/v/1CNWjc4hNH/",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
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
