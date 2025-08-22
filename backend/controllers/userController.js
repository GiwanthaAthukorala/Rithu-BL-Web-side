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

    console.log("Registration attempt with:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo: bankAccountNo ? "***hidden***" : "missing",
    });

    // Validate required fields
    const requiredFields = {
      firstName,
      lastName,
      email,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !requiredFields[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Check for existing email
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        errorType: "email",
        message: "Email is already registered",
      });
    }

    // Check for existing phone number
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        errorType: "phone",
        message: "Phone number is already registered",
      });
    }

    // Check for existing account number
    const accountExists = await User.findOne({ bankAccountNo });
    if (accountExists) {
      return res.status(400).json({
        success: false,
        errorType: "bankAccountNo",
        message: "Bank account number already registered",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNo,
      password,
    });

    console.log("User created successfully:", user._id);

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

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        errorType: field,
        message: `${field} is already registered`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed due to server error",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    console.log("Login attempt:", {
      email: req.body.email,
      password: "***hidden***",
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Login successful for user:", user._id);

    res.json({
      success: true,
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
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// Get user profile (protected)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      ...user.toObject(),
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
