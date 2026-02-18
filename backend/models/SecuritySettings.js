import mongoose from "mongoose";

const SecuritySettingsSchema = new mongoose.Schema(
  {
    sessionTimeoutMinutes: { type: Number, default: 30, min: 1, max: 1440 },
    maxLoginAttempts: { type: Number, default: 3, min: 1, max: 20 },
    lockDurationHours: { type: Number, default: 24, min: 1, max: 168 },
    requireEmailVerification: { type: Boolean, default: true },
    jwtExpiresIn: { type: String, default: "15m" }, // optional
  },
  { timestamps: true },
);

export default mongoose.model("SecuritySettings", SecuritySettingsSchema);
