const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const generateImageHash = require("../utils/generateImageHash");
const isSimilarHash = require("../utils/isSimilarHash");
const cloudinary = require("../utils/cloudinary");

const createSubmission = async (req, res) => {
  console.log("==== SUBMISSION REQUEST RECEIVED ====");

  try {
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "File upload failed" });
    }

    const userId = req.user._id;
    const cloudinaryUrl = req.file.path;
    const publicId = req.file.filename; // Cloudinary public ID for deletion

    // Generate perceptual hash
    const uploadedImageHash = await generateImageHash(cloudinaryUrl);

    // Compare with previous hashes
    const previousSubmissions = await Submission.find({
      user: userId,
      imageHash: { $ne: null },
    });

    for (const submission of previousSubmissions) {
      if (isSimilarHash(uploadedImageHash, submission.imageHash)) {
        // Delete similar image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        return res.status(400).json({
          success: false,
          message:
            "Duplicate or similar image detected. Please upload a different screenshot.",
        });
      }
    }

    // Save to DB if unique
    const submission = await Submission.create({
      user: userId,
      platform: req.body.platform || "facebook",
      screenshot: cloudinaryUrl,
      imageHash: uploadedImageHash,
      status: "approved",
      amount: 0.8,
    });

    // Update earnings
    let earnings = await Earnings.findOne({ user: userId });
    if (!earnings) {
      earnings = await Earnings.create({
        user: userId,
        totalEarned: 0.8,
        availableBalance: 0.8,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
    } else {
      earnings.totalEarned += 0.8;
      earnings.availableBalance += 0.8;
      await earnings.save();
    }

    // Emit real-time update
    const io = req.app.get("io");
    io.to(userId.toString()).emit("earningsUpdate", earnings);

    return res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
      earnings,
    });
  } catch (error) {
    console.error("❌ Submission Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user submissions",
      error: error.message,
    });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
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
      message: "Submission approved and earnings updated",
      data: {
        submission,
        earnings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    submission.status = "rejected";
    await submission.save();

    res.json({
      success: true,
      message: "Submission rejected",
      data: {
        submission,
        earnings,
      },
    });
  } catch (error) {
    console.error("Approval Error : ", error);
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

// Export as separate named exports
//module.exports.uploadFile = upload.single("screenshot");
module.exports.createSubmission = createSubmission;
module.exports.getUserSubmissions = getUserSubmissions;
module.exports.approveSubmission = approveSubmission;
module.exports.rejectSubmission = rejectSubmission;
