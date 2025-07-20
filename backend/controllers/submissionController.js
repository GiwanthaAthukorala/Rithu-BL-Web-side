const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);

const createSubmission = async (req, res) => {
  try {
    if (!req.files || !req.files.screenshot) {
      return res.status(400).json({ message: "Please upload a screenshot" });
    }

    const screenshot = req.files.screenshot;
    const uploadDir = path.join(__dirname, "../public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${screenshot.name}`;
    const filePath = path.join(uploadDir, fileName);
    await screenshot.mv(filePath);

    const submission = await Submission.create({
      user: req.user._id,
      platform: req.body.platform,
      screenshot: `/uploads/${fileName}`,
      status: "pending",
      amount: 0.8,
    });

    res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
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
    io.to(submission.user.toString()).emit("earningsUpdate", earnings);

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

module.exports = {
  createSubmission,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
};
