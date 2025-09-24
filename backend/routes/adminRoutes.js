const express = require("express");
const router = express.Router();
const { adminAuth, superAdminAuth } = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// Admin authentication routes
router.post("/login", adminController.adminLogin);
router.post("/logout", adminAuth, adminController.adminLogout);

// Admin dashboard routes
router.get("/stats", adminAuth, adminController.getAdminStats);
router.get("/submissions", adminAuth, adminController.getAllSubmissions);
router.get(
  "/submissions/:platformType/:submissionId",
  adminAuth,
  adminController.getSubmissionById
);

// Admin actions
router.put(
  "/submissions/status",
  adminAuth,
  adminController.updateSubmissionStatus
);
router.delete(
  "/submissions/:platformType/:submissionId",
  adminAuth,
  adminController.deleteSubmission
);

// User management (super admin only)
router.get("/users", superAdminAuth, adminController.getAllUsers);
router.put(
  "/users/:userId/status",
  superAdminAuth,
  adminController.toggleUserStatus
);
router.post(
  "/users/create-admin",
  superAdminAuth,
  adminController.createAdminUser
);

// System management (super admin only)
//router.get("/system/stats", superAdminAuth, adminController.getSystemStats);

module.exports = router;
