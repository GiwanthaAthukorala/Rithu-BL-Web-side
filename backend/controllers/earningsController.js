const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");

exports.getUserEarnings = async (req, res) => {
  try {
    const earnings = await Earnings.findOne({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        ...(earnings
          ? earnings.toObject()
          : {
              totalEarned: 0,
              availableBalance: 0,
              withdrawnAmount: 0,
              pendingWithdrawal: 0,
            }),
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
