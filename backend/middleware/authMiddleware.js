const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        return next();
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
    }

    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized",
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
