const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

router.get(
  "/submissions",
  protect,
  admin,
  adminController.getPendingSubmissions
);
router.get(
  "/withdrawals",
  protect,
  admin,
  adminController.getPendingWithdrawals
);
router.put(
  "/withdrawals/:id",
  protect,
  admin,
  adminController.processWithdrawal
);

module.exports = router;
