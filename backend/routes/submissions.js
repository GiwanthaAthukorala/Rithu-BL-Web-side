const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  upload.single("screenshot"),
  submissionController.createSubmission
);
router.put("/:id/approve", protect, submissionController.approveSubmission);

module.exports = router;
