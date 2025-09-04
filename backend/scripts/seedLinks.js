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
    url: "https://www.facebook.com/profile.php?id=61579745357840&mibextid=wwXIfr&mibextid=wwXIfr",
    title: "Kolumbus කොලොම්බස් - පෙජ් එකට ලයික් කරන්න  ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/19ho1X61DX/",
    title: "පෝස්ට් එකට ලයික් කරන්න ",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1FgRCVx5Lm/?mibextid=wwXIfr",
    title: "Serena Fernando - ෆෙස්බුක් පෙජ් ඒක විතරක් ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16KogoGGyE/",
    title:
      "සිංහල සහ ඉතිහාසය with Kaushalya මිස් - ෆෙස්බුක් පෙජ් ඒක විතරක් ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/174Fpd7BJr/?mibextid=wwXIfr",
    title: "Namal S Fonseka - ෆෙස්බුක් පෙජ් ඒක විතරක් ලයික් ෆලෝ කරන්න",
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
