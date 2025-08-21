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
    url: "https://www.facebook.com/share/v/16vmjJVdNj/?mibextid=wwXIfr",
    title: "පොස්ට් එකට ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1FLNRLctdC/?mibextid=wwXIfr",
    title: "පොස්ට් එකට ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/19ySCzyenn/?mibextid=wwXIfr",
    title: "පොස්ට් එකට ලයික් කරන්න",
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
  {
    url: "https://www.facebook.com/share/1EqCrVLXBv/?mibextid=wwXIfr",
    title: "Chathura Vithanage - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/SuwaPiyasaHomeNursing",
    title: "Suwa Piyasa Home Nursing - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1ChgcGPsKX/",
    title: "𝐌 𝐢 𝐧 𝐝 - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/SantaDoraHospital",
    title: "Santa Dora Hospital - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1B5ySJ3hEQ/",
    title: "Blue Cross Hospital - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1JgK3WSNU3/?mibextid=wwXIfr",
    title: "පුන්සර විතානගේ (පුන්සර මල්ලී) - ෆෙස්බුක් profile ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1B2PBfKSfp/",
    title: "Kaushan - ෆෙස්බුක් පෙජ් ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/176m5DZxQ6/",
    title: "ONE 100 Consultants - ෆෙස්බුක් පෙජ් ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16x61jaVWQ/?mibextid=wwXIfr",
    title: "Sirasa Housing & - ෆෙස්බුක් පෙජ් ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61578843232009&notif_id=1755669738607664&notif_t=profile_plus_admin_invite&ref=notif",
    title: "Oushada With Green Investment - ෆෙස්බුක් පෙජ් ලයික් ෆලෝ කරන්න",
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
