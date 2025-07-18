const Earnings = require("../models/Earnings");

// Get user earnings
exports.getUserEarnings = async (req, res) => {
  try {
    const earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings) {
      return res.json({
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
      });
    }

    res.json(earnings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get earnings", error: error.message });
  }
};

// Withdraw earnings
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

    earnings.availableBalance -= amount;
    earnings.withdrawnAmount += amount;
    await earnings.save();

    // Here you would integrate with your payment gateway
    // For now, we'll just log the withdrawal
    console.log(`Withdrawal processed for user ${req.user._id}: Rs ${amount}`);

    res.json({
      success: true,
      message: `Withdrawal request for Rs ${amount} submitted successfully`,
      newBalance: earnings.availableBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Withdrawal failed", error: error.message });
  }
};
