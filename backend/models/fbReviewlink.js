const mongoose = require("mongoose");

// Check if the model already exists to prevent overwriting
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
      default: 2.0, // Rs. 2 per submission
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error
module.exports =
  mongoose.models.fbReviewLink ||
  mongoose.model("fbReviewLink", fbReviewLinkSchema);
