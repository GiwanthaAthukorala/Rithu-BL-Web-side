const mongoose = require("mongoose");

const fbReviewLinkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("fbReviewLink", fbReviewLinkSchema);
