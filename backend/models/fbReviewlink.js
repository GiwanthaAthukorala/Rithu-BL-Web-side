const mongoose = require("mongoose");

const fbReviewLinkSchema = new mongoose.Schema(
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
      default: 30.0,
    },
    submissionCount: {
      type: Number,
      default: 30,
    },
    //lastSubmissionTime: {
    //type: Date,
    //default: Date.now,
  },

  { timestamps: true }
);

module.exports = mongoose.model("fbReviewLink", fbReviewLinkSchema);
