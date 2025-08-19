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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const facebookLinks = [
  {
    url: "https://www.facebook.com/share/1CVEp1bSgv/?mibextid=wwXIfr",
    title: "CS Studio and Communication - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61579385003718",
    title: "හෙළ වෙදකම - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61574553219898&mibextid=wwXIfr&mibextid=wwXIfr",
    title: "SHILA - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
    url: "https://www.facebook.com/minukoreanlanguagecenter/",
    title: "Minu Korean Language Center - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17ftfCoqE4/?mibextid=wwXIfr",
    title: "TMR Travels & Tours Private Ltd - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16Ms5EmWDc/",
    title: "Various Technologies - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/178gYEzVBS/?mibextid=wwXIfr",
    title: "NOIRELLE - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
    url: "https://www.facebook.com/share/14GRFoHwkjx/",
    title: "CDEM Hospital - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/16RRjrSB6z/",
    title: "Sunway Motors - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61579035706488",
    title: "SA Trading - ෆෙස්බුක් පෙජ් එක ලයික් ෆලෝ කරන්න",
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
    url: "https://www.facebook.com/share/p/14Dnr3BUXJb/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් එකට ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1Jehcmr1kr/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් එකට ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/r/173DdbWUGR/?mibextid=wwXIfr",
    title: "ෆෙස්බුක් පොස්ට් එකට ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
];

async function seedLinks() {
  try {
    await connectDB();

    for (const linkData of facebookLinks) {
      const existingLink = await Link.findOne({ url: linkData.url });
      if (!existingLink) {
        await Link.create(linkData);
        console.log(`Added link: ${linkData.title}`);
      } else {
        console.log(`Link already exists: ${linkData.title}`);
      }
    }

    console.log("Links seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedLinks();
