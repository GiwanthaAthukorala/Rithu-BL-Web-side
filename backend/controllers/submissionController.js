const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const fs = require("fs");
const path = require("path");

// Submit screenshot
exports.createSubmission = async (req, res) => {
  try {
    const { platform } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a screenshot" });
    }

    const submission = await Submission.create({
      user: req.user._id,
      platform,
      screenshot: req.file.filename,
    });

    // Update earnings when submission is approved (admin will approve later)
    res.status(201).json({
      success: true,
      message: "Screenshot submitted successfully! It will be reviewed.",
      data: submission,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

// Admin approval of submission
exports.approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Submission already processed" });
    }

    submission.status = "approved";
    await submission.save();

    // Update user's earnings
    const earnings = await Earnings.findOne({ user: submission.user });

    if (!earnings) {
      await Earnings.create({
        user: submission.user,
        totalEarned: submission.amount,
        availableBalance: submission.amount,
      });
    } else {
      earnings.totalEarned += submission.amount;
      earnings.availableBalance += submission.amount;
      await earnings.save();
    }

    res.json({
      success: true,
      message: "Submission approved and earnings updated",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};
