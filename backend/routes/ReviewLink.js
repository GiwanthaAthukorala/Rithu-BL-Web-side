const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const ReviewLink = require("../models/ReviewLink");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Get all active FB Review links (filtering out completed ones)
router.get("/:platform", protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Get user with clicked FB Review links
    console.log(`Fetching links for platform: ${platform}, user: ${userId}`);

    // Validate platform
    const validPlatforms = [
      "facebook",
      "tiktok",
      "instagram",
      "youtube",
      "whatsapp",
    ];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid platform. Must be one of: facebook, tiktok, instagram, youtube, whatsapp",
      });
    }

    // Get user with clicked links
    const user = await User.findById(userId).select("clickedLinks");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get links that user has completed (clicked once)
    const completedLinkIds = user.clickedLinks
      .filter((link) => {
        if (!link || !link.linkId) return false;
        return (
          link.platform === platform &&
          (link.submitted || link.clickCount >= link.maxClicks)
        );
      })
      .map((link) => {
        return link.linkId.toString
          ? link.linkId.toString()
          : String(link.linkId);
      });

    console.log(`Completed link IDs: ${completedLinkIds.join(", ")}`);

    // Get active links that user hasn't completed
    const links = await Link.find({
      platform,
      active: true,
      _id: {
        $nin: completedLinkIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    console.log(`Found ${links.length} active links`);

    // Add click count info to each link
    const linksWithClickInfo = links.map((link) => {
      const userLink = user.clickedLinks.find(
        (clicked) =>
          clicked.linkId && clicked.linkId.toString() === link._id.toString()
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
        maxClicks: userLink ? userLink.maxClicks : 1, // Changed from 3 to 1
        remainingClicks: userLink
          ? userLink.maxClicks - userLink.clickCount
          : 1, // Changed from 3 to 1
      };
    });

    res.json({ success: true, data: linksWithClickInfo });
  } catch (error) {
    console.error("Get links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get links",
      error: error.message,
    });
  }
});

// Track FB Review link click
router.post("/:linkId/click", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    console.log(`Tracking click for link: ${linkId}, user: ${userId}`);

    // Validate linkId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    // Check if link exists
    const link = await Link.findById(linkId);
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

    let userLink = user.clickedLinks.find(
      (clicked) => clicked.linkId && clicked.linkId.toString() === linkId
    );

    if (!userLink) {
      // First time clicking this link
      user.clickedLinks.push({
        linkId: new mongoose.Types.ObjectId(linkId),
        platform: link.platform,
        clickCount: 0,
        maxClicks: 1, // Changed from 3 to 1
        submitted: false,
      });

      // Save and get the newly added link
      await user.save();

      // Refresh user to get the updated clickedLinks
      const updatedUser = await User.findById(userId);
      userLink = updatedUser.clickedLinks.find(
        (clicked) => clicked.linkId && clicked.linkId.toString() === linkId
      );
    }

    // Check if user has reached the click limit (now 1)
    if (userLink.clickCount >= userLink.maxClicks) {
      return res.status(400).json({
        success: false,
        message: "This link has already been clicked",
        maxClicksReached: true,
      });
    }

    // Increment click count
    userLink.clickCount += 1;
    userLink.lastClickedAt = new Date();

    // If this was the only click needed, mark as submitted
    if (userLink.clickCount >= userLink.maxClicks) {
      userLink.submitted = true;
      userLink.submittedAt = new Date();
    }

    await user.save();

    res.json({
      success: true,
      clickCount: userLink.clickCount,
      maxClicks: userLink.maxClicks,
      remainingClicks: userLink.maxClicks - userLink.clickCount,
      completed: userLink.clickCount >= userLink.maxClicks,
    });
  } catch (error) {
    console.error("Link click error:", error);
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
