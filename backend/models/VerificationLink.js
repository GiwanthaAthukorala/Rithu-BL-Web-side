const mongoose = require("mongoose");

const verificationLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ["facebook", "instagram", "youtube", "tiktok"],
  },
  links: [
    {
      title: String,
      url: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("VerificationLink", verificationLinkSchema);
