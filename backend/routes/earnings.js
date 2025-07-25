const express = require("express");
const router = express.Router();
const Earnings = require("../models/Earnings");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
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

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    console.error("Earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get earnings",
      error: error.message,
    });
  }
});

module.exports = router;
