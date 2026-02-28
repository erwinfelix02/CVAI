import mongoose from "mongoose";

const GeneralSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Graystone Institute of the Philippines" },
    supportEmail: { type: String, default: "support@university.edu" },
    siteDescription: { type: String, default: "Campus Virtual Assistant for Information" },
    aiWelcomeMessage: {
      type: String,
      default: "Hello! I'm your campus assistant. How can I help you today?",
    },
  },
  { _id: false },
);

const SettingsSchema = new mongoose.Schema(
  {
    general: { type: GeneralSettingsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);