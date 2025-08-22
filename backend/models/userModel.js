const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { platform } = require("os");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    username: { type: String, unique: true, sparse: true },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    bankAccountNo: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    clickedLinks: [
      {
        linkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
        },
        clickCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        maxClicks: {
          type: Number,
          default: 3,
        },
        lastClickedAt: {
          type: Date,
          default: Date.now,
        },
        submitted: {
          type: Boolean,
          default: false,
        },
        submittedAt: Date,
      },
    ],

    fbReviewClickedLinks: [
      {
        linkId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Link",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["facebook", "tiktok", "instagram", "youtube", "whatsapp"],
        },
        clickCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        maxClicks: {
          type: Number,
          default: 3,
        },
        lastClickedAt: {
          type: Date,
          default: Date.now,
        },
        submitted: {
          type: Boolean,
          default: false,
        },
        submittedAt: Date,
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.username) {
    this.username = this.email.split("@")[0];
  }

  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
