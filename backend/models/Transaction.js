const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: String,
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    rejectionReason: String,
    bankDetails: {
      name: String,
      branch: String,
      account: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
