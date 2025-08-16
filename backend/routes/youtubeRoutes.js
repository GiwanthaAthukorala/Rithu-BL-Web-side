const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createSubmission,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/YoutubeSubmission");
const uploadFile = require("../middleware/uploadMiddleware");

// User routes
router.post("/", protect, uploadFile.single("screenshot"), createSubmission);
router.get("/my-youtubeSubmissions", protect, getUserSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveSubmission);
router.put("/:id/reject", protect, admin, rejectSubmission);

module.exports = router;
