const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");
const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReview = require("../models/fbReviewlink");

exports.getUserEarnings = async (req, res) => {
  try {
    console.log("Fetching earnings for user:", req.user._id);

    // Validate user exists
    if (!req.user?._id) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get approved submissions from all sources
    const [fbSubmissions, ytSubmissions, reviewSubmissions] = await Promise.all(
      [
        Submission.find({ user: req.user._id, status: "approved" }),
        YoutubeSubmission.find({ user: req.user._id, status: "approved" }),
        FbReview.find({ user: req.user._id, status: "approved" }),
      ]
    );

    console.log(
      `Found ${fbSubmissions.length} FB, ${ytSubmissions.length} YT, ${reviewSubmissions.length} Review submissions`
    );

    // Calculate totals
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
    const calculatedTotal = fbTotal + ytTotal + reviewTotal;

    console.log("Calculated totals:", {
      fbTotal,
      ytTotal,
      reviewTotal,
      calculatedTotal,
    });

    // Find or create earnings record
    let earnings = await Earnings.findOne({ user: req.user._id });

    if (!earnings) {
      console.log("Creating new earnings record");
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: calculatedTotal,
        availableBalance: calculatedTotal,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      console.log("Updating existing earnings record");
      // Update existing record
      earnings.totalEarned = calculatedTotal;
      earnings.availableBalance =
        calculatedTotal - earnings.withdrawnAmount - earnings.pendingWithdrawal;
      await earnings.save();
    }

    // Get recent transactions
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("Earnings data prepared successfully");

    res.json({
      success: true,
      data: {
        ...earnings.toObject(),
        transactions,
      },
    });
  } catch (error) {
    console.error("Earnings controller error:", error);
    res.status(500).json({
      success: false,
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
      data: transaction,
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
