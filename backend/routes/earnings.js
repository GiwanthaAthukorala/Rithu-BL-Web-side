const express = require("express");
const router = express.Router();
const Earnings = require("../models/Earnings");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    let earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings) {
      // Create new earnings record if doesn't exist
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    }

    // Get user's submissions count
    const submissions = await Submission.find({
      user: req.user._id,
      status: "approved",
    });

    // Calculate total earned from approved submissions
    const calculatedEarned = submissions.reduce(
      (total, sub) => total + sub.amount,
      0
    );

    // Ensure earnings are in sync
    if (earnings.totalEarned !== calculatedEarned) {
      earnings.totalEarned = calculatedEarned;
      earnings.availableBalance =
        calculatedEarned -
        earnings.withdrawnAmount -
        earnings.pendingWithdrawal;
      await earnings.save();
    }

    res.json({
      success: true,
      data: earnings,
      submissionsCount: submissions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get earnings",
      error: error.message,
    });
  }
});

module.exports = router;
