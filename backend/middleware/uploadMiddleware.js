const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "submissions",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 600, crop: "scale" }], // Optional
  },
});

const upload = multer({ storage });

module.exports = upload;
