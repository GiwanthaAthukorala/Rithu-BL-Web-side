const express = require("express");
const router = express.Router();
const earningsController = require("../controllers/earningsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, earningsController.getUserEarnings);
router.post("/withdraw", protect, earningsController.withdrawEarnings);

module.exports = router;
