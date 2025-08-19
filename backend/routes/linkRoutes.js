const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Link = require("../models/Link");
const User = require("../models/userModel");

// Get all active links for a platform (filtering out clicked ones)
router.get("/:platform", protect, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id;

    // Get user with clicked links
    const user = await User.findById(userId).select("clickedLinks");
    const clickedLinkIds = user.clickedLinks
      .filter((link) => link.platform === platform && link.submitted)
      .map((link) => link.linkId);

    // Get active links that user hasn't clicked and submitted
    const links = await Link.find({
      platform,
      active: true,
      _id: { $nin: clickedLinkIds },
    });

    res.json({ success: true, data: links });
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

    // Check if user already clicked this link
    const user = await User.findById(userId);
    const alreadyClicked = user.clickedLinks.some(
      (clicked) => clicked.linkId.toString() === linkId && !clicked.submitted
    );

    if (alreadyClicked) {
      return res.json({ success: true, alreadyClicked: true });
    }

    // Add to user's clicked links
    user.clickedLinks.push({
      linkId,
      platform: link.platform,
      submitted: false,
    });

    await user.save();

    res.json({ success: true, alreadyClicked: false, link });
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
module.exports = router;
