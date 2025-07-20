const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);

// OCR verification function
const verifyScreenshot = async (imageBuffer) => {
  try {
    const tempFilePath = path.join(__dirname, "../temp/temp.png");
    await writeFileAsync(tempFilePath, imageBuffer);

    const {
      data: { text },
    } = await Tesseract.recognize(tempFilePath, "eng");

    // Check for platform indicators
    const lowerText = text.toLowerCase();
    return {
      facebook: lowerText.includes("facebook"),
      instagram: lowerText.includes("instagram"),
      tiktok: lowerText.includes("tiktok"),
      youtube: lowerText.includes("youtube"),
    };
  } catch (error) {
    console.error("OCR error:", error);
    return null;
  }
};

exports.createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a screenshot" });
    }

    const submission = await Submission.create({
      user: req.user._id,
      platform: req.body.platform,
      screenshot: req.file.path,
      status: "pending",
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission already processed" });
    }

    // Update submission status
    submission.status = "approved";
    await submission.save();

    // Update user's earnings
    let earnings = await Earnings.findOne({ user: submission.user });

    if (!earnings) {
      earnings = await Earnings.create({
        user: submission.user,
        totalEarned: submission.amount,
        availableBalance: submission.amount,
      });
    } else {
      earnings.totalEarned += submission.amount;
      earnings.availableBalance += submission.amount;
      await earnings.save();
    }

    // Emit real-time update
    req.app
      .get("io")
      .to(submission.user.toString())
      .emit("earningsUpdate", earnings);

    res.json({
      success: true,
      message: "Submission approved and earnings updated",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      message: "Approval failed",
      error: error.message,
    });
  }
};

exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission already processed" });
    }

    submission.status = "rejected";
    await submission.save();

    res.json({
      success: true,
      message: "Submission rejected",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      message: "Rejection failed",
      error: error.message,
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get submissions",
      error: error.message,
    });
  }
};
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get submissions",
      error: error.message,
    });
  }
};
