const express = require("express");
const router = express.Router();
const {
  getAllSubmissions,
  getPendingWithdrawals,
  processWithdrawal,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/submissions", protect, admin, getAllSubmissions);
router.get("/withdrawals", protect, admin, getPendingWithdrawals);
router.put("/withdrawals/:id", protect, admin, processWithdrawal);

module.exports = router;
