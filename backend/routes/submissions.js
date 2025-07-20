const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const submissionController = require("../controllers/submissionController");

// User routes
router.post(
  "/",
  protect,
  upload.single("screenshot"),
  submissionController.createSubmission
);
router.get("/my-submissions", protect, submissionController.getUserSubmissions);

// Admin routes
router.put(
  "/:id/approve",
  protect,
  admin,
  submissionController.approveSubmission
);
router.put(
  "/:id/reject",
  protect,
  admin,
  submissionController.rejectSubmission
);

module.exports = router;
