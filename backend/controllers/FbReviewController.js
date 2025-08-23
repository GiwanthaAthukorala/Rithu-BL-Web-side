const FbReviewSubmission = require("../models/fbReviewLink");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");

const createFbReviewSubmission = async (req, res) => {
  console.log("==== REVIEW SUBMISSION REQUEST RECEIVED ====");
  console.log("User ID:", req.user?._id);
  console.log("Uploaded file:", req.file);

  const startTime = Date.now();

  try {
    if (!req.file || !req.file.path) {
      console.error("❌ File upload failed. req.file is missing or invalid.");
      return res.status(400).json({
        success: false,
        message: "File upload failed. No file received from client.",
      });
    }

    const userId = req.user._id;
    const cloudinaryUrl = req.file.path;

    // 1. Generate hash
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

    // Check for duplicates
    const previousSubmissions = await FbReviewSubmission.find({
      user: userId,
      imageHash: { $ne: null },
    }).limit(10);

    for (const submission of previousSubmissions) {
      if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
        return res.status(400).json({
          success: false,
          message: `This screenshot is too similar to one you submitted on ${new Date(
            submission.createdAt
          ).toLocaleDateString()}. Please upload a different screenshot.`,
          errorType: "DUPLICATE_IMAGE",
          previousDate: new Date(submission.createdAt).toLocaleDateString(),
        });
      }
    }

    console.log("Hashing took", Date.now() - startTime, "ms");

    const submission = await FbReviewSubmission.create({
      user: req.user._id,
      screenshot: cloudinaryUrl,
      imageHash: uploadedImageHash,
      status: "approved",
      amount: 30.0,
    });

    let earnings = await Earnings.findOne({ user: req.user._id });
    if (!earnings) {
      earnings = await Earnings.create({
        user: req.user._id,
        totalEarned: 30.0,
        availableBalance: 30.0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += 30.0;
      earnings.availableBalance += 30.0;
      await earnings.save();
    }

    // Emit update to the user
    const io = req.app.get("io");
    io.to(req.user._id.toString()).emit("earningsUpdate", earnings);
    console.log("Updated earnings:", earnings);

    res.status(201).json({
      success: true,
      message: "Review submission created successfully",
      data: submission,
      earnings,
    });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserReviewSubmissions = async (req, res) => {
  try {
    const submissions = await FbReviewSubmission.find({ user: req.user._id });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get Review submissions",
      error: error.message,
    });
  }
};

const approveReviewSubmission = async (req, res) => {
  try {
    const submission = await FbReviewSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Review submission not found" });
    }
    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    submission.status = "approved";
    await submission.save();

    // Update earnings
    let earnings = await Earnings.findOne({ user: submission.user });
    if (!earnings) {
      earnings = await Earnings.create({
        user: submission.user,
        totalEarned: 30.0,
        availableBalance: 30.0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += 30.0;
      earnings.availableBalance += 30.0;
      await earnings.save();
    }

    // Emit update to the user
    const io = req.app.get("io");
    io.to(submission.user.toString()).emit("earningsUpdate", {
      totalEarned: earnings.totalEarned,
      availableBalance: earnings.availableBalance,
      pendingWithdrawal: earnings.pendingWithdrawal,
      withdrawnAmount: earnings.withdrawnAmount,
    });

    res.json({
      success: true,
      message: "Review submission approved and earnings updated",
      data: {
        submission,
        earnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

const rejectReviewSubmission = async (req, res) => {
  try {
    const submission = await FbReviewSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Review submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    submission.status = "rejected";
    await submission.save();

    res.json({
      success: true,
      message: "Review submission rejected",
      data: submission,
    });
  } catch (error) {
    console.error("Rejection Error:", error);
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

module.exports = {
  createFbReviewSubmission,
  getUserReviewSubmissions,
  approveReviewSubmission,
  rejectReviewSubmission,
};
