const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  adminLogin,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", adminLogin);
router.get("/profile", protect, getUserProfile);
router.get("/admin", protect, admin, (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard",
  });
});

module.exports = router;
