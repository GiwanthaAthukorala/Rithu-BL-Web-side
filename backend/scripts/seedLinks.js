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
    url: "https://www.facebook.com/share/14DZYSVoFtN/",
    title: "Shaliya's Apex Aura   (Shaliya Nasik) - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/19n1oebTqS/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/17RgZ3RuQm/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1CWU4YYedW/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1CU1YHSG1J/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/v/19BEZfn4fW/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/1B8B7mproE/?mibextid=wwXIfr",
    title: "පොස්ට් ඒකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1EaWUrBRqQ/?mibextid=wwXIfr",
    title: "අපි Magazine - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17FatNA9t2/?mibextid=wwXIfr",
    title: "Fluent Flow Books - පෙජ් එකට ලයික් කරන්න  ",
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
