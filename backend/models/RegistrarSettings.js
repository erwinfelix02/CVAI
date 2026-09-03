import mongoose from "mongoose";

const registrarSettingsSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true, default: "2023-2024" },
    semester: { type: String, required: true, default: "2nd Semester" },

    enrollmentOpen: { type: Boolean, default: true },
    maxStudentsPerSection: { type: Number, default: 45 },

    processingDays: { type: Number, default: 5 },
    autoApproveSimpleDocs: { type: Boolean, default: false },

    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },

    // ── Archive Auto-Deletion Setting ───────────────────────────
    archiveRetentionDays: { type: Number, default: 30, min: 1 }, // 👈 ADD THIS FIELD

    updatedBy: { type: String, default: "system" }, // optional (who updated)
  },
  { timestamps: true },
);

export default mongoose.model("RegistrarSettings", registrarSettingsSchema);