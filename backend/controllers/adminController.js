/*const Submission = require("../models/Submission");
const Earnings = require("../models/Earnings");
const Transaction = require("../models/Transaction");*/
const VerificationLink = require("../models/VerificationLink");

exports.getVerificationLinks = async (req, res) => {
  try {
    const links = await VerificationLink.find();
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update verification links for a platform
exports.updateVerificationLinks = async (req, res) => {
  try {
    const { platform } = req.params;
    const { links } = req.body;

    // Validate platform
    if (!["facebook", "instagram", "youtube", "tiktok"].includes(platform)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid platform" });
    }

    // Find or create the platform entry
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
};

// Add a single link to a platform
exports.addVerificationLink = async (req, res) => {
  try {
    const { platform } = req.params;
    const { title, url } = req.body;

    if (!["facebook", "instagram", "youtube", "tiktok"].includes(platform)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid platform" });
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
};

// Toggle link status (active/inactive)
exports.toggleLinkStatus = async (req, res) => {
  try {
    const { platform, linkId } = req.params;

    const verificationLink = await VerificationLink.findOne({ platform });
    if (!verificationLink) {
      return res
        .status(404)
        .json({ success: false, message: "Platform not found" });
    }

    const link = verificationLink.links.id(linkId);
    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: "Link not found" });
    }

    link.active = !link.active;
    await verificationLink.save();

    res.json({ success: true, data: verificationLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
