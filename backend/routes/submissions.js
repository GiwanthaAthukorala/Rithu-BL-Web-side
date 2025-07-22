const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  uploadFile,
  createSubmission,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/submissionController");

// User routes
router.post("/", protect, uploadFile, createSubmission);
router.get("/my-submissions", protect, getUserSubmissions);

// Admin routes
router.put("/:id/approve", protect, admin, approveSubmission);
router.put("/:id/reject", protect, admin, rejectSubmission);

module.exports = router;
