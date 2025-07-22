const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, "../../public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const validTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/JPG/PNG images allowed"), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Controller functions
const createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const submission = await Submission.create({
      user: req.user._id,
      platform: req.body.platform || "facebook",
      screenshot: `/uploads/${req.file.filename}`,
      status: "pending",
      amount: 0.8,
    });

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      message: "Submission failed",
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

    let earnings = await Earnings.findOne({ user: submission.user });
    if (!earnings) {
      earnings = await Earnings.create({
        user: submission.user,
        totalEarned: submission.amount,
        availableBalance: submission.amount,
      });
    } else {
      earnings.totalEarned += submission.amount;
      earnings.availableBalance += submission.amount;
      await earnings.save();
    }

    const io = req.app.get("io");
    io.to(submission.user.toString()).emit("earningsUpdate", {
      totalEarned: earnings.totalEarned,
      availableBalance: earnings.availableBalance,
      pendingWithdrawal: earnings.pendingWithdrawal,
      withdrawnAmount: earnings.withdrawnAmount,
    });

    res.json({
      success: true,
      message: "Submission approved",
      data: submission,
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
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error: error.message });
  }
};

// Export as separate named exports
module.exports.uploadFile = upload.single("screenshot");
module.exports.createSubmission = createSubmission;
module.exports.getUserSubmissions = getUserSubmissions;
module.exports.approveSubmission = approveSubmission;
module.exports.rejectSubmission = rejectSubmission;
