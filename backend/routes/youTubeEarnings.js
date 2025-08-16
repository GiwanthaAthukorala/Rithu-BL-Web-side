const express = require("express");
const router = express.Router();
const Earnings = require("../models/youtubeEarning");
const Submission = require("../models/youTube");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    // Validate user exists
    if (!req.user?._id) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find or create earnings record
    let earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings) {
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    }

    // Get approved submissions
    const submissions = await Submission.find({
      user: req.user._id,
      status: "approved",
    });

    // Calculate total from approved submissions
    const calculatedTotal = submissions.reduce(
      (sum, sub) => sum + (sub.amount || 0),
      0
    );

    // Update earnings if needed
    if (earnings.totalEarned !== calculatedTotal) {
      earnings.totalEarned = calculatedTotal;
      earnings.availableBalance =
        calculatedTotal - earnings.withdrawnAmount - earnings.pendingWithdrawal;
      await earnings.save();
    }

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    console.error("Earnings route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get earnings",
      error: error.message,
    });
  }
});

module.exports = router;
