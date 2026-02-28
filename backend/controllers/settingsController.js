import Settings from "../models/Settings.js";
import validator from "validator";

async function getSingletonSettings() {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  return doc;
}

export const getGeneralSettings = async (req, res) => {
  try {
    const doc = await getSingletonSettings();
    return res.json(doc.general);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load general settings." });
  }
};

export const updateGeneralSettings = async (req, res) => {
  try {
    const { siteName, supportEmail, siteDescription, aiWelcomeMessage } = req.body;

    // ✅ basic validation + sanitize
    const next = {
      siteName: validator.escape(String(siteName || "").trim()),
      supportEmail: validator.normalizeEmail(String(supportEmail || "").trim()) || "",
      siteDescription: validator.escape(String(siteDescription || "").trim()),
      aiWelcomeMessage: validator.escape(String(aiWelcomeMessage || "").trim()),
    };

    if (!next.siteName) {
      return res.status(400).json({ message: "Site Name is required." });
    }

    if (!next.supportEmail || !validator.isEmail(next.supportEmail)) {
      return res.status(400).json({ message: "Support Email must be a valid email." });
    }

    const doc = await getSingletonSettings();

    doc.general = {
      ...doc.general.toObject(),
      ...next,
    };

    await doc.save();

    return res.json({ message: "General settings updated.", general: doc.general });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update general settings." });
  }
};