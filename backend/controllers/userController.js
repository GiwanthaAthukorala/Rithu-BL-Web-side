const { admin } = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    } = req.body;
    console.log("Registration attempt with:", req.body);
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "bankName",
      "bankBranch",
      "bankAccountNo",
      "password",
    ];
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        errorType: "email",
        message: "Email is already registered",
      });
    }
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        errorType: "phone",
        message: "Phone number is already registered",
      });
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", field: "email" });
    }

    const accountExists = await User.findOne({ bankAccountNo });
    if (accountExists) {
      return res.status(400).json({
        message: "Bank account number already Registered",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    });
    console.log("User created successfully:", user);

    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bankName: user.bankName,
        bankBranch: user.bankBranch,
        bankAccountNo: user.bankAccountNo,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate key errors
    return res.status(500).json({
      success: false,
      message: "Registration failed due to server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bankName: user.bankName,
      bankBranch: user.bankBranch,
      bankAccountNo: user.bankAccountNo,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// Get user profile (protected)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if user has admin privileges
    if (!["admin", "superadmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "Admin login failed. Please try again.",
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, adminLogin };
