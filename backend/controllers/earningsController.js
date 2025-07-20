const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.getUserEarnings = async (req, res) => {
  try {
    const earnings = await Earnings.findOne({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!earnings) {
      return res.json({
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        transactions: [],
      });
    }

    res.json({
      ...earnings.toObject(),
      transactions,
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
    const user = await User.findById(req.user._id);

    if (!earnings || earnings.availableBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance for withdrawal",
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      type: "debit",
      amount,
      description: "Withdrawal request",
      reference: `WD-${Date.now()}`,
      status: "pending",
      bankDetails: {
        name: user.bankName,
        branch: user.bankBranch,
        account: user.bankAccountNo,
      },
    });

    // Update earnings (but don't deduct yet - wait for admin approval)
    earnings.pendingWithdrawal += amount;
    await earnings.save();

    // Emit real-time update
    req.app.get("io").to(req.user._id.toString()).emit("withdrawalRequest", {
      earnings,
      transaction,
    });

    res.json({
      success: true,
      message: `Withdrawal request for Rs ${amount} submitted for approval`,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Withdrawal failed",
      error: error.message,
    });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { transactionId, action } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const earnings = await Earnings.findOne({ user: transaction.user });

    if (action === "approve") {
      // Deduct from available balance
      earnings.availableBalance -= transaction.amount;
      earnings.withdrawnAmount += transaction.amount;
      earnings.pendingWithdrawal -= transaction.amount;

      transaction.status = "completed";

      // Here you would integrate with your payment gateway
      // For now, we'll just log the successful payment
      console.log(
        `Payment processed to user ${transaction.user}: Rs ${transaction.amount}`
      );
    } else if (action === "reject") {
      // Return funds to available balance
      earnings.availableBalance += transaction.amount;
      earnings.pendingWithdrawal -= transaction.amount;

      transaction.status = "failed";
      transaction.rejectionReason = req.body.reason || "Withdrawal rejected";
    }

    await earnings.save();
    await transaction.save();

    // Emit real-time update
    req.app
      .get("io")
      .to(transaction.user.toString())
      .emit("withdrawalProcessed", {
        earnings,
        transaction,
      });

    res.json({
      success: true,
      message: `Withdrawal ${action}d successfully`,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Withdrawal processing failed",
      error: error.message,
    });
  }
};
