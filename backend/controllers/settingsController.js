import Settings from "../models/Settings.js";
import validator from "validator";

async function getSingletonSettings() {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  return doc;
}

function isPlainSafeString(value) {
  return typeof value === "string";
}

function rejectNonStringField(value) {
  return Array.isArray(value) || (value !== null && typeof value === "object");
}

function hasSuspiciousInput(value) {
  const suspiciousPattern =
    /(\$where|\$ne|\$eq|\$gt|\$gte|\$lt|\$lte|\$in|\$nin|\$or|\$and|\$regex|\$expr|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|--|;|\/\*|\*\/)/i;

  return suspiciousPattern.test(value);
}

function cleanString(value) {
  if (!isPlainSafeString(value)) return "";
  return validator.escape(value.trim());
}

export const getGeneralSettings = async (req, res) => {
  try {
    const doc = await getSingletonSettings();

    return res.json({
      siteName: doc.general.siteName,
      supportEmail: doc.general.supportEmail,
      siteDescription: doc.general.siteDescription,
      schoolPhoneNumber: doc.general.schoolPhoneNumber,
      schoolLocation: doc.general.schoolLocation,
    });
  } catch (err) {
    console.error("getGeneralSettings error:", err);
    return res.status(500).json({ message: "Failed to load general settings." });
  }
};

export const updateGeneralSettings = async (req, res) => {
  try {
    const {
      siteName,
      supportEmail,
      siteDescription,
      schoolPhoneNumber,
      schoolLocation,
    } = req.body || {};

    if (
      rejectNonStringField(siteName) ||
      rejectNonStringField(supportEmail) ||
      rejectNonStringField(siteDescription) ||
      rejectNonStringField(schoolPhoneNumber) ||
      rejectNonStringField(schoolLocation)
    ) {
      return res.status(400).json({
        message: "Invalid payload. All fields must be plain text values.",
      });
    }

    const rawSiteName = isPlainSafeString(siteName) ? siteName.trim() : "";
    const rawSupportEmail = isPlainSafeString(supportEmail)
      ? supportEmail.trim()
      : "";
    const rawSiteDescription = isPlainSafeString(siteDescription)
      ? siteDescription.trim()
      : "";
    const rawSchoolPhoneNumber = isPlainSafeString(schoolPhoneNumber)
      ? schoolPhoneNumber.trim()
      : "";
    const rawSchoolLocation = isPlainSafeString(schoolLocation)
      ? schoolLocation.trim()
      : "";

    if (!rawSiteName) {
      return res.status(400).json({ message: "Site Name is required." });
    }

    if (!rawSupportEmail) {
      return res.status(400).json({ message: "Support Email is required." });
    }

    if (!rawSiteDescription) {
      return res.status(400).json({ message: "Site Description is required." });
    }

    if (!rawSchoolPhoneNumber) {
      return res.status(400).json({ message: "School Phone Number is required." });
    }

    if (!rawSchoolLocation) {
      return res.status(400).json({ message: "School Location is required." });
    }

    if (rawSiteName.length > 120) {
      return res
        .status(400)
        .json({ message: "Site Name must not exceed 120 characters." });
    }

    if (rawSupportEmail.length > 120) {
      return res
        .status(400)
        .json({ message: "Support Email must not exceed 120 characters." });
    }

    if (rawSiteDescription.length > 250) {
      return res
        .status(400)
        .json({ message: "Site Description must not exceed 250 characters." });
    }

    if (rawSchoolPhoneNumber.length > 20) {
      return res
        .status(400)
        .json({ message: "School Phone Number must not exceed 20 characters." });
    }

    if (rawSchoolLocation.length > 150) {
      return res
        .status(400)
        .json({ message: "School Location must not exceed 150 characters." });
    }

    if (!validator.isEmail(rawSupportEmail)) {
      return res
        .status(400)
        .json({ message: "Support Email must be a valid email." });
    }

    if (!validator.matches(rawSchoolPhoneNumber, /^\+63[0-9]{10}$/)) {
  return res.status(400).json({
    message:
      "School Phone Number must start with +63 and contain 10 digits after it. Example: +639123456789",
  });
}
    if (
      hasSuspiciousInput(rawSiteName) ||
      hasSuspiciousInput(rawSupportEmail) ||
      hasSuspiciousInput(rawSiteDescription) ||
      hasSuspiciousInput(rawSchoolPhoneNumber) ||
      hasSuspiciousInput(rawSchoolLocation)
    ) {
      return res.status(400).json({
        message: "Suspicious input detected. Please remove invalid characters or patterns.",
      });
    }

    const next = {
      siteName: cleanString(rawSiteName),
      supportEmail:
        validator.normalizeEmail(rawSupportEmail, {
          gmail_remove_dots: false,
        }) || "",
      siteDescription: cleanString(rawSiteDescription),
      schoolPhoneNumber: cleanString(rawSchoolPhoneNumber),
      schoolLocation: cleanString(rawSchoolLocation),
    };

    const doc = await getSingletonSettings();

    doc.general.siteName = next.siteName;
    doc.general.supportEmail = next.supportEmail;
    doc.general.siteDescription = next.siteDescription;
    doc.general.schoolPhoneNumber = next.schoolPhoneNumber;
    doc.general.schoolLocation = next.schoolLocation;

    await doc.save();

    return res.json({
      message: "General settings updated.",
      general: {
        siteName: doc.general.siteName,
        supportEmail: doc.general.supportEmail,
        siteDescription: doc.general.siteDescription,
        schoolPhoneNumber: doc.general.schoolPhoneNumber,
        schoolLocation: doc.general.schoolLocation,
      },
    });
  } catch (err) {
    console.error("updateGeneralSettings error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update general settings." });
  }
};