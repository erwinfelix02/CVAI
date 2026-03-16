import RegistrarSettings from "../models/RegistrarSettings.js";
import { addLog } from "../utils/logActivity.js";

async function ensureSettingsDoc() {
  let doc = await RegistrarSettings.findOne();
  if (!doc) doc = await RegistrarSettings.create({});
  return doc;
}

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown IP"
  );
}

export const getRegistrarSettings = async (req, res) => {
  try {
    const settings = await ensureSettingsDoc();
    return res.status(200).json(settings);
  } catch (err) {
    console.error("getRegistrarSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateRegistrarSettings = async (req, res) => {
  try {
    const body = req.body;

    if (!body.academicYear || !body.semester) {
      return res.status(400).json({
        message: "academicYear and semester are required.",
      });
    }

    const settings = await ensureSettingsDoc();

    // Save old values before update
    const oldValues = {
      academicYear: settings.academicYear,
      semester: settings.semester,
      enrollmentOpen: settings.enrollmentOpen,
      maxStudentsPerSection: settings.maxStudentsPerSection,
      processingDays: settings.processingDays,
      autoApproveSimpleDocs: settings.autoApproveSimpleDocs,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
    };

    // New values
    const newValues = {
      academicYear: body.academicYear,
      semester: body.semester,
      enrollmentOpen: !!body.enrollmentOpen,
      maxStudentsPerSection: Number(body.maxStudentsPerSection ?? 45),
      processingDays: Number(body.processingDays ?? 5),
      autoApproveSimpleDocs: !!body.autoApproveSimpleDocs,
      emailNotifications: !!body.emailNotifications,
      smsNotifications: !!body.smsNotifications,
    };

    settings.academicYear = newValues.academicYear;
    settings.semester = newValues.semester;
    settings.enrollmentOpen = newValues.enrollmentOpen;
    settings.maxStudentsPerSection = newValues.maxStudentsPerSection;
    settings.processingDays = newValues.processingDays;
    settings.autoApproveSimpleDocs = newValues.autoApproveSimpleDocs;
    settings.emailNotifications = newValues.emailNotifications;
    settings.smsNotifications = newValues.smsNotifications;

    // optional: store who updated
    const updatedBy =
      body.updatedBy ||
      body.user ||
      body.email ||
      "registrar";

    settings.updatedBy = updatedBy;

    await settings.save();

    // Build change list
    const changes = [];

    Object.keys(newValues).forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changes.push(`${key}: "${oldValues[key]}" -> "${newValues[key]}"`);
      }
    });

    addLog({
      action: "Update Registrar Settings",
      user: updatedBy,
      role: "Registrar",
      type: "System",
      details:
        changes.length > 0
          ? `Registrar settings updated. Changes: ${changes.join(", ")}`
          : "Registrar settings updated with no detected field changes.",
      ip: getClientIp(req),
      status: "success",
    });

    return res.status(200).json(settings);
  } catch (err) {
    console.error("updateRegistrarSettings error:", err);

    addLog({
      action: "Update Registrar Settings",
      user:
        req.body?.updatedBy ||
        req.body?.user ||
        req.body?.email ||
        "registrar",
      role: "Registrar",
      type: "System",
      details: `Failed to update registrar settings: ${err.message}`,
      ip: getClientIp(req),
      status: "error",
    });

    return res.status(500).json({ message: "Server error" });
  }
};