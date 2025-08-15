const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const youtubeSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["facebook", "instagram", "tiktok", "youtube", "whatsapp"],
    },
    screenshot: {
      type: String,
      required: true,
    },
    imageHash: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    amount: {
      type: Number,
      default: 1.0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YoutubeSubmission", youtubeSubmissionSchema);
