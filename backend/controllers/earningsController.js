const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const FbCommentSubmission = require("../models/FbCommentSubmission");
const GoogleReviewModel = require("../models/GoogleReviewModel");

exports.getUserEarnings = async (req, res) => {
  try {
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

    const [
      fbSubmissions,
      ytSubmissions,
      reviewSubmissions,
      commentSubmissions,
      googleReviewsSubmissions,
      userTransactions,
    ] = await Promise.all([
      Submission.find({ user: req.user._id, status: "approved" }),
      YoutubeSubmission.find({ user: req.user._id, status: "approved" }),
      FbReviewSubmission.find({ user: req.user._id, status: "approved" }),
      FbCommentSubmission.find({ user: req.user._id, status: "approved" }),
      GoogleReviewModel.find({ user: req.user._id, status: "approved" }),
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(18),
    ]);

    console.log("📊 Earnings data:", earnings);
    console.log("📊 FB submissions:", fbSubmissions.length);
    console.log("📊 YT submissions:", ytSubmissions.length);
    console.log("📊 Facebook Comment Submission ", commentSubmissions.length);
    console.log(
      "📊 Google Review submissions",
      googleReviewsSubmissions.length
    );

    // Calculate total from all submission types
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
    const commentTotal = commentSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 15),
      0
    );
    const googleTotal = googleReviewsSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 40),
      0
    );

    const calculatedTotal =
      fbTotal + ytTotal + reviewTotal + commentTotal + googleTotal;

    // Update earnings if needed - REMOVED DUPLICATE BLOCK
    if (earnings.totalEarned !== calculatedTotal) {
      earnings.totalEarned = calculatedTotal;
      earnings.availableBalance =
        calculatedTotal - earnings.withdrawnAmount - earnings.pendingWithdrawal;
      await earnings.save();
    }

    res.json({
      success: true,
      data: earnings,
      transactions: userTransactions,
    });
  } catch (error) {
    console.error("❌ Earnings controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get earnings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.withdrawEarnings = async (req, res) => {
  try {
    const { amount } = req.body;
    const minWithdrawal = 500;

    if (!amount || amount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is Rs ${minWithdrawal}`,
      });
    }
    const earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings || earnings.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance for withdrawal",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      amount,
      status: "pending",
      reference: `WD-${Date.now()}`,
      bankDetails: {
        name: req.user.bankName,
        branch: req.user.bankBranch,
        account: req.user.bankAccountNo,
      },
    });

    earnings.availableBalance -= amount;
    earnings.pendingWithdrawal += amount;
    await earnings.save();

    // Emit socket event if needed
    const io = req.app.get("io");
    if (io) {
      io.to(req.user._id.toString()).emit("earningsUpdate", earnings);
    }

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      earnings: earnings,
      transaction: transaction,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({
      success: false,
      message: "Withdrawal failed",
      error: error.message,
    });
  }
};
