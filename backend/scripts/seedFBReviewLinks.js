require("dotenv").config();
const mongoose = require("mongoose");
const ReviewLink = require("../models/ReviewLink");

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

const facebookReviewLinks = [
  /*{
    url: "https://www.facebook.com/SantaDoraHospital/reviews",
    title: "Santa Dora Hospital - Review this page",
    platform: "facebook",
    earnings: 30.0,
  },
  {
    url: "https://www.facebook.com/BlueCrossHospital/reviews",
    title: "Blue Cross Hospital - Review this page",
    platform: "facebook",
    earnings: 30.0,
  },*/
  // Add more review links as needed
];

async function seedFBReviewLinks() {
  try {
    await connectDB();

    await ReviewLink.deleteMany({});
    console.log("Cleared existing FB Review links");

    for (const linkData of facebookReviewLinks) {
      await ReviewLink.create(linkData);
      console.log(`Added FB Review link: ${linkData.title}`);
    }

    console.log("FB Review links seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedFBReviewLinks();
