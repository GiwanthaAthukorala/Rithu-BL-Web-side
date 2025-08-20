const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Link = require("../models/Link");
const User = require("../models/userModel");
const { link } = require("fs");

// Get all active links for a platform (filtering out clicked ones)
router.get("/:platform", protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Get user with clicked links
    const user = await User.findById(userId).select("clickedLinks");
    const completedLinkIds = user.clickedLinks
      .filter(
        (link) =>
          link.platform === platform &&
          (link.submitted || link.clickCount >= link.maxClicks)
      )
      .map((link) => link.linkId.toString());
    // Get active links that user hasn't clicked and submitted
    const links = await Link.find({
      platform,
      active: true,
      _id: { $nin: clickedLinkIds },
    });

    // Add click count info to each link
    const linksWithClickInfo = links.map((link) => {
      const userLink = user.clickedLinks.find(
        (clicked) => clicked.linkId.toString() === link._id.toString()
      );

      return {
        ...link.toObject(),
        userClickCount: userLink ? userLink.clickCount : 0,
        maxClicks: userLink ? userLink.maxClicks : 4,
        remainingClicks: userLink
          ? userLink.maxClicks - userLink.clickCount
          : 4,
      };
    });

    res.json({ success: true, data: linksWithClickInfo });
  } catch (error) {
    console.error("Get links error:", error);
    res.status(500).json({ success: false, message: "Failed to get links" });
  }
});

// Track link click
router.post("/:linkId/click", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    // Check if link exists
    const link = await Link.findById(linkId);
    if (!link || !link.active) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found" });
    }

    // Find or create user's clicked link record
    const user = await User.findById(userId);
    let userLink = user.clickedLinks.find(
      (clicked) => clicked.linkId.toString() === linkId
    );

    if (!userLink) {
      // First time clicking this link
      userLink = {
        linkId: linkId,
        platform: link.platform,
        clickCount: 0,
        maxClicks: 4,
        submitted: false,
      };
      user.clickedLinks.push(userLink);
      userLink = user.clickedLinks[user.clickedLinks.length - 1];
    }

    // Check if user has reached the click limit
    if (userLink.clickCount >= userLink.maxClicks) {
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
    console.error("Link click error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to track link click" });
  }
});

// Mark link as submitted (when user uploads screenshot)
router.post("/:linkId/submit", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    // Update user's clicked link to mark as submitted
    const user = await User.findById(userId);
    const clickedLink = user.clickedLinks.find(
      (link) => link.linkId.toString() === linkId
    );

    if (clickedLink) {
      clickedLink.submitted = true;
      clickedLink.submittedAt = new Date();
      await user.save();

      return res.json({ success: true, message: "Link marked as submitted" });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: "Link not found in user's clicked links",
        });
    }
  } catch (error) {
    console.error("Link submit error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark link as submitted" });
  }
});

// Reset link clicks (for testing or admin purposes)
router.post("/:linkId/reset", protect, async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const clickedLinkIndex = user.clickedLinks.findIndex(
      (link) => link.linkId.toString() === linkId
    );

    if (clickedLinkIndex !== -1) {
      user.clickedLinks[clickedLinkIndex].clickCount = 0;
      user.clickedLinks[clickedLinkIndex].submitted = false;
      user.clickedLinks[clickedLinkIndex].submittedAt = null;
      await user.save();

      return res.json({ success: true, message: "Link clicks reset" });
    } else {
      return res
        .status(404)
        .json({
          success: false,
          message: "Link not found in user's clicked links",
        });
    }
  } catch (error) {
    console.error("Link reset error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset link clicks" });
  }
});

module.exports = router;
