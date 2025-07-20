const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const User = require("../models/userModel");

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "pending" })
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

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      type: "debit",
      status: "pending",
    })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pending withdrawals",
      error: error.message,
    });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { action } = req.body;
    const withdrawal = await Transaction.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    const earnings = await Earnings.findOne({ user: withdrawal.user });

    if (action === "approve") {
      // Deduct from available balance
      earnings.availableBalance -= withdrawal.amount;
      earnings.withdrawnAmount += withdrawal.amount;
      earnings.pendingWithdrawal -= withdrawal.amount;

      withdrawal.status = "completed";
    } else if (action === "reject") {
      // Return funds to available balance
      earnings.availableBalance += withdrawal.amount;
      earnings.pendingWithdrawal -= withdrawal.amount;

      withdrawal.status = "failed";
      withdrawal.rejectionReason = req.body.reason || "Withdrawal rejected";
    }

    await earnings.save();
    await withdrawal.save();

    res.json({
      success: true,
      message: `Withdrawal ${action}d successfully`,
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      message: "Withdrawal processing failed",
      error: error.message,
    });
  }
};
