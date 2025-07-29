const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "rithu_business",
  api_key: process.env.CLOUDINARY_API_KEY || "459922719853922",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "i9x-n_aJFdHtds0Atb1C9sXCyzw",
});

console.log("Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

module.exports = cloudinary;
