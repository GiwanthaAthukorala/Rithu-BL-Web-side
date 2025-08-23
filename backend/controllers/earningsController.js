const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");

exports.getUserEarnings = async (req, res) => {
  try {
    const [
      earnings,
      transactions,
      fbSubmissions,
      ytSubmissions,
      reviewSubmissions,
    ] = await Promise.all([
      Earnings.findOne({ user: req.user._id }),
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(18),
      Submission.find({ user: req.user._id, status: "approved" }),
      YoutubeSubmission.find({ user: req.user._id, status: "approved" }),
      FbReviewSubmission.find({ user: req.user._id, status: "approved" }),
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

    const calculatedTotal = fbTotal + ytTotal + reviewTotal;

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

    if (amount < minWithdrawal) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is Rs ${minWithdrawal}`,
      });
    }

    const earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings || earnings.availableBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance for withdrawal",
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: "debit",
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

    const io = req.app.get("io");
    io.emit("newWithdrawal", transaction);

    res.json({
      success: true,
      message: "Withdrawal request submitted",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Withdrawal failed",
      error: error.message,
    });
  }
};
