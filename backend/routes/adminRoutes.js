const express = require("express");
const router = express.Router();
const { adminProtect, checkPermission } = require("../middleware/adminAuth");
const VerificationLink = require("../models/VerificationLink");

// Get all verification links
router.use(adminProtect);

// Get all verification links
router.get("/links", checkPermission("manage_links"), async (req, res) => {
  try {
    const links = await VerificationLink.find();
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update verification links for a platform
router.put("/links/:platform", protect, admin, async (req, res) => {
  try {
    const { platform } = req.params;
    const { links } = req.body;

    if (!["facebook", "instagram", "youtube", "tiktok"].includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    let verificationLink = await VerificationLink.findOne({ platform });

    if (!verificationLink) {
      verificationLink = new VerificationLink({ platform, links });
    } else {
      verificationLink.links = links;
    }

    await verificationLink.save();
    res.json({ success: true, data: verificationLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new link to a platform
router.post("/links/:platform", protect, admin, async (req, res) => {
  try {
    const { platform } = req.params;
    const { title, url } = req.body;

    if (!["facebook", "instagram", "youtube", "tiktok"].includes(platform)) {
      return res.status(400).json({ message: "Invalid platform" });
    }

    let verificationLink = await VerificationLink.findOne({ platform });

    if (!verificationLink) {
      verificationLink = new VerificationLink({
        platform,
        links: [{ title, url }],
      });
    } else {
      verificationLink.links.push({ title, url });
    }

    await verificationLink.save();
    res.json({ success: true, data: verificationLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle link status
router.patch(
  "/links/:platform/:linkId/toggle",
  protect,
  admin,
  async (req, res) => {
    try {
      const { platform, linkId } = req.params;

      const verificationLink = await VerificationLink.findOne({ platform });
      if (!verificationLink) {
        return res.status(404).json({ message: "Platform not found" });
      }

      const link = verificationLink.links.id(linkId);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      link.active = !link.active;
      await verificationLink.save();
      res.json({ success: true, data: verificationLink });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
