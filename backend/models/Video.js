const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: [
        "youtube",
        "facebook",
        "instagram",
        "tiktok",
        "vimeo",
        "dailymotion",
        "custom",
      ],
      default: "youtube",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    embedUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
      default: 60,
    },
    rewardAmount: {
      type: Number,
      default: 1,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxViews: {
      type: Number,
      default: null, // null means unlimited
    },
    currentViews: {
      type: Number,
      default: 0,
    },
    // Add these missing fields
    category: {
      type: String,
      default: "general",
    },
    tags: [
      {
        type: String,
      },
    ],
    targetAudience: {
      type: String,
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better performance
videoSchema.index({ isActive: 1, maxViews: 1, currentViews: 1 });

module.exports = mongoose.model("Video", videoSchema);
