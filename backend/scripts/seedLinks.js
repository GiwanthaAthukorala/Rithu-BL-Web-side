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
    url: "https://www.facebook.com/share/175gmnG5MQ/",
    title: "Ammta.Hudu ツ - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/GrandSpaandWellnesslk/",
    title: "Grand Spa & Wellness Pvt Ltd - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/15wAK2vKza/",
    title: "Hundred Fashion - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/ctismartkandy",
    title:
      "CTI SMART Mobile Phone Repair Service Center-Kandy - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61577094362250",
    title: "Global Tech - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1DRToiVMLR/",
    title: "Maths with අකිල අමරතුංග - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1YYapLHDJw/",
    title: "Besty - බෙස්ටි - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61579877851251",
    title: "SM Cushion Work - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
