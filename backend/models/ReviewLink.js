const mongoose = require("mongoose");

const ReviewlinkSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "facebook",
    },
    active: {
      type: Boolean,
      default: true,
    },
    earnings: {
      type: Number,
      default: 30.0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewLink", ReviewlinkSchema);
