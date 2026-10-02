import SecuritySettings from "../models/SecuritySettings.js";

async function getOrCreateSettings() {
  let s = await SecuritySettings.findOne();
  if (!s) s = await SecuritySettings.create({});
  return s;
}

export const getSecuritySettings = async (req, res) => {
  try {
    const s = await getOrCreateSettings();
    res.json(s);
  } catch (e) {
    res.status(500).json({ message: "Failed to load security settings" });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const {
      sessionTimeoutMinutes,
      maxLoginAttempts,
      lockDurationHours,
      requireEmailVerification,
      jwtExpiresIn,
    } = req.body;

    const s = await getOrCreateSettings();

    // Update only fields provided
    if (sessionTimeoutMinutes != null) s.sessionTimeoutMinutes = sessionTimeoutMinutes;
    if (maxLoginAttempts != null) s.maxLoginAttempts = maxLoginAttempts;
    if (lockDurationHours != null) s.lockDurationHours = lockDurationHours;
    if (requireEmailVerification != null) s.requireEmailVerification = requireEmailVerification;
    if (jwtExpiresIn != null) s.jwtExpiresIn = jwtExpiresIn;

    await s.save();
    res.json({ message: "Security settings updated", settings: s });
  } catch (e) {
    res.status(500).json({ message: "Failed to update security settings" });
  }
};
