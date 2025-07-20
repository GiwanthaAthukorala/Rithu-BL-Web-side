const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// User routes
router.post(
  "/",
  protect,
  upload.single("screenshot"),
  submissionController.createSubmission
);

router.get("/my-submissions", protect, submissionController.getUserSubmissions);

// Admin routes
router.get("/", protect, admin, submissionController.getAllSubmissions);

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
