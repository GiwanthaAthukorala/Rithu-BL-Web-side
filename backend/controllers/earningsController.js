const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const FbCommentSubmission = require("../models/FbCommentSubmission");
const GoogleReviewModel = require("../models/GoogleReviewModel");

exports.getUserEarnings = async (req, res) => {
  try {
    const [
      earnings,
      transactions,
      fbSubmissions,
      ytSubmissions,
      reviewSubmissions,
      commentSubmissions,
      googleReviewsSubmissions,
    ] = await Promise.all([
      Earnings.findOne({ user: req.user._id }),
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(18),
      Submission.find({ user: req.user._id, status: "approved" }),
      YoutubeSubmission.find({ user: req.user._id, status: "approved" }),
      FbReviewSubmission.find({ user: req.user._id, status: "approved" }),
      FbCommentSubmission.find({ user: req.user._id, status: "approved" }),
      GoogleReviewModel.find({ user: req.user._id, status: "approved" }),
    ]);

    // Calculate total from both submission types
    const fbTotal = fbSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 1),
      0
    );
    const ytTotal = ytSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 2),
      0
    );
    const reviewTotal = reviewSubmissions.reduce(
      (sum, sub) => sum + (sub.amount || 30), // Should be 30, not 1
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

    // Create earnings record if doesn't exist
    let earningsData = earnings;
    if (!earningsData) {
      earningsData = await Earnings.create({
        user: req.user._id,
        totalEarned: calculatedTotal,
        availableBalance: calculatedTotal,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else if (earningsData.totalEarned !== calculatedTotal) {
      // Update if calculation differs
      earningsData.totalEarned = calculatedTotal;
      earningsData.availableBalance =
        calculatedTotal -
        (earningsData.withdrawnAmount + earningsData.pendingWithdrawal);
      await earningsData.save();
    }

    res.json({
      success: true,
      data: {
        ...earningsData.toObject(),
        transactions: transactions || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get earnings",
      error: error.message,
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

    // Find user's earnings
    const earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings || earnings.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance for withdrawal",
      });
    }

    // Create transaction record
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

    // Update earnings
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
