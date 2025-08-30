const express = require("express");
const router = express.Router();
const Earnings = require("../models/Earnings");
const Submission = require("../models/Submission");
const { protect } = require("../middleware/authMiddleware");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const fbCommentSubmission = require("../models/fbCommentSubmission");

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
    const [
      fbSubmissions,
      ytSubmissions,
      reviewSubmissions,
      commmentSubmissions,
    ] = await Promise.all([
      Submission.find({
        user: req.user._id,
        status: "approved",
      }),
      YoutubeSubmission.find({
        user: req.user._id,
        status: "approved",
      }),
      FbReviewSubmission.find({
        user: req.user._id,
        status: "approved",
      }),
      fbCommentSubmission.find({
        user: req.user._id,
        status: "approved",
      }),
    ]);
    const fbTotal = fbSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 1),
      0
    );
    const ytTotal = ytSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 2),
      0
    );
    const reviewTotal = reviewSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 30),
      0
    );
    const commentTotal = commmentSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 15),
      0
    );

    const calculatedTotal = fbTotal + ytTotal + reviewTotal + commentTotal;

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
