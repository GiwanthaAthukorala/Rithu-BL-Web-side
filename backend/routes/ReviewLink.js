const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const ReviewLink = require("../models/ReviewLink");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Get all active FB Review links (filtering out completed ones)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with clicked FB Review links
    const user = await User.findById(userId).select("fbReviewClickedLinks");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get links that user has completed (clicked 1 time)
    const completedLinkIds = user.fbReviewClickedLinks
      .filter((link) => link.clickCount >= 1)
      .map((link) => link.linkId.toString());

    // Get active links that user hasn't completed
    const links = await ReviewLink.find({
      active: true,
      _id: {
        $nin: completedLinkIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    // Add click count info to each link
    const linksWithClickInfo = links.map((link) => {
      const userLink = user.fbReviewClickedLinks.find(
        (clicked) => clicked.linkId.toString() === link._id.toString()
      );

      return {
        _id: link._id,
        url: link.url,
        title: link.title,
        platform: link.platform,
        active: link.active,
        earnings: link.earnings,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        userClickCount: userLink ? userLink.clickCount : 0,
        maxClicks: 1, // Single click only for FB Review
        remainingClicks: userLink ? 1 - userLink.clickCount : 1,
      };
    });

    res.json({ success: true, data: linksWithClickInfo });
  } catch (error) {
    console.error("Get FB Review links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get FB Review links",
      error: error.message,
    });
  }
});

// Track FB Review link click
router.post("/:linkId/click", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Check if link exists
    const link = await ReviewLink.findById(linkId);
    if (!link || !link.active) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found or inactive" });
    }

    // Find or create user's clicked link record
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let userLink = user.fbReviewClickedLinks.find(
      (clicked) => clicked.linkId.toString() === linkId
    );

    if (!userLink) {
      // First time clicking this link
      user.fbReviewClickedLinks.push({
        linkId: new mongoose.Types.ObjectId(linkId),
        platform: "facebook",
        clickCount: 0,
        maxClicks: 1, // Single click only for FB Review
      });
      await user.save();

      // Refresh user to get the updated clickedLinks
      const updatedUser = await User.findById(userId);
      userLink = updatedUser.fbReviewClickedLinks.find(
        (clicked) => clicked.linkId.toString() === linkId
      );
    }

    // Check if user has reached the click limit (1 click)
    if (userLink.clickCount >= 1) {
      return res.status(400).json({
        success: false,
        message: "Maximum clicks reached for this link",
        maxClicksReached: true,
      });
    }

    // Increment click count
    userLink.clickCount += 1;
    userLink.lastClickedAt = new Date();

    await user.save();

    res.json({
      success: true,
      clickCount: userLink.clickCount,
      maxClicks: userLink.maxClicks,
      remainingClicks: userLink.maxClicks - userLink.clickCount,
    });
  } catch (error) {
    console.error("FB Review link click error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track link click",
      error: error.message,
    });
  }
});

// Mark FB Review link as submitted
router.post("/:linkId/submit", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Update user's clicked link to mark as submitted
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const clickedLink = user.fbReviewClickedLinks.find(
      (link) => link.linkId.toString() === linkId
    );

    if (clickedLink) {
      clickedLink.submitted = true;
      clickedLink.submittedAt = new Date();
      await user.save();

      return res.json({ success: true, message: "Link marked as submitted" });
    } else {
      return res.status(404).json({
        success: false,
        message: "Link not found in user's clicked links",
      });
    }
  } catch (error) {
    console.error("FB Review link submit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark link as submitted",
      error: error.message,
    });
  }
});

// Admin routes for managing FB Review links
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const links = await ReviewLink.find({});
    res.json({ success: true, data: links });
  } catch (error) {
    console.error("Get all FB Review links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get FB Review links",
      error: error.message,
    });
  }
});

router.post("/admin/create", protect, admin, async (req, res) => {
  try {
    const { url, title, earnings } = req.body;

    if (!url || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: url, title",
      });
    }

    const link = await ReviewLink.create({
      url,
      title,
      platform: "facebook",
      earnings: earnings || 30.0, // Default to Rs 30 for reviews
    });

    res.json({ success: true, data: link });
  } catch (error) {
    console.error("Create FB Review link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create FB Review link",
      error: error.message,
    });
  }
});

module.exports = router;
