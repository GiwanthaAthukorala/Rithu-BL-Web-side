const Submission = require("../models/youTube");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");

const createYoutubeSubmission = async (req, res) => {
  console.log("==== YOUTUBE SUBMISSION REQUEST ====");
  console.log("User ID:", req.user?._id);
  console.log("File received:", !!req.file);

  try {
    // Validate authentication
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate file upload
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "No screenshot file provided",
      });
    }

    const userId = req.user._id;
    const cloudinaryUrl = req.file.path;

    // Generate image hash for duplicate detection
    let uploadedImageHash;
    try {
      uploadedImageHash = await generateImageHash(cloudinaryUrl);
    } catch (hashError) {
      console.error("Hash generation failed:", hashError);
      return res.status(400).json({
        success: false,
        message: "Could not process image. Please try a different file.",
      });
    }

    // Check for duplicate submissions
    const recentSubmissions = await Submission.find({
      user: userId,
      imageHash: { $exists: true, $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    for (const submission of recentSubmissions) {
      if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
        return res.status(400).json({
          success: false,
          message: `This screenshot is too similar to one you submitted on ${new Date(
            submission.createdAt
          ).toLocaleDateString()}. Please upload a different screenshot.`,
          errorType: "DUPLICATE_IMAGE",
          previousDate: submission.createdAt,
        });
      }
    }

    // Create submission
    const submission = await Submission.create({
      user: userId,
      platform: req.body.platform || "youtube",
      screenshot: cloudinaryUrl,
      imageHash: uploadedImageHash,
      status: "approved", // Auto-approve for now
      amount: 2.0,
    });

    // Update user earnings
    let earnings = await Earnings.findOne({ user: userId });
    if (!earnings) {
      earnings = await Earnings.create({
        user: userId,
        totalEarned: 2.0,
        availableBalance: 2.0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += 2.0;
      earnings.availableBalance += 2.0;
      await earnings.save();
    }

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("earningsUpdate", {
        totalEarned: earnings.totalEarned,
        availableBalance: earnings.availableBalance,
        pendingWithdrawal: earnings.pendingWithdrawal,
        withdrawnAmount: earnings.withdrawnAmount,
      });
    }

    res.status(201).json({
      success: true,
      message: "YouTube submission created successfully",
      data: {
        submission,
        earnings: {
          totalEarned: earnings.totalEarned,
          availableBalance: earnings.availableBalance,
          pendingWithdrawal: earnings.pendingWithdrawal,
          withdrawnAmount: earnings.withdrawnAmount,
        },
      },
    });
  } catch (error) {
    console.error("YouTube submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create submission",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUserYoutubeSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-imageHash"); // Don't send hash to client

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
};

const approveYoutubeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Submission already processed",
      });
    }

    submission.status = "approved";
    await submission.save();

    // Update earnings
    let earnings = await Earnings.findOne({ user: submission.user });
    if (!earnings) {
      earnings = await Earnings.create({
        user: submission.user,
        totalEarned: submission.amount,
        availableBalance: submission.amount,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += submission.amount;
      earnings.availableBalance += submission.amount;
      await earnings.save();
    }

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(submission.user.toString()).emit("earningsUpdate", {
        totalEarned: earnings.totalEarned,
        availableBalance: earnings.availableBalance,
        pendingWithdrawal: earnings.pendingWithdrawal,
        withdrawnAmount: earnings.withdrawnAmount,
      });
    }

    res.json({
      success: true,
      message: "Submission approved successfully",
      data: { submission, earnings },
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve submission",
    });
  }
};

const rejectYoutubeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Submission already processed",
      });
    }

    submission.status = "rejected";
    await submission.save();

    res.json({
      success: true,
      message: "Submission rejected",
      data: { submission },
    });
  } catch (error) {
    console.error("Rejection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject submission",
    });
  }
};

module.exports = {
  createYoutubeSubmission,
  getUserYoutubeSubmissions,
  approveYoutubeSubmission,
  rejectYoutubeSubmission,
};
