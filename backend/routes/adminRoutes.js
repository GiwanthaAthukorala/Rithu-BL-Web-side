const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
} = require("../controllers/adminController");

// All routes are protected and require admin role
router.get("/submissions", protect, admin, getAllSubmissions);
router.get("/stats", protect, admin, getSubmissionStats);
router.put("/submissions/status", protect, admin, updateSubmissionStatus);

module.exports = router;
