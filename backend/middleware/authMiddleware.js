const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        return next();
      } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({
          success: false,
          message: "Not authorized, token failed",
        });
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Not authorized",
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && ["admin", "superadmin"].includes(req.user.role)) {
    return next();
  }
  res.status(403).json({
    success: false,
    message: "Not authorized as admin",
  });
};

module.exports = { protect, admin };
