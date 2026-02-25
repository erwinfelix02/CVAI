import RegistrarSettings from "../models/RegistrarSettings.js";

async function ensureSettingsDoc() {
  let doc = await RegistrarSettings.findOne();
  if (!doc) doc = await RegistrarSettings.create({});
  return doc;
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

    settings.academicYear = body.academicYear;
    settings.semester = body.semester;

    settings.enrollmentOpen = !!body.enrollmentOpen;
    settings.maxStudentsPerSection = Number(body.maxStudentsPerSection ?? 45);

    settings.processingDays = Number(body.processingDays ?? 5);
    settings.autoApproveSimpleDocs = !!body.autoApproveSimpleDocs;

    settings.emailNotifications = !!body.emailNotifications;
    settings.smsNotifications = !!body.smsNotifications;

    await settings.save();
    return res.status(200).json(settings);
  } catch (err) {
    console.error("updateRegistrarSettings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};