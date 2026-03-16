import mongoose from "mongoose";
import validator from "validator";

const phoneRegex = /^\+63[0-9]{10}$/;

const GeneralSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Graystone Institute of the Philippines",
      validate: {
        validator: (v) => typeof v === "string" && v.trim().length >= 3,
        message: "Site name is invalid.",
      },
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: "support@university.edu",
      validate: {
        validator: (v) => validator.isEmail(String(v || "")),
        message: "Support email is invalid.",
      },
    },
    siteDescription: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "Campus Virtual Assistant for Information",
      validate: {
        validator: (v) => typeof v === "string" && v.trim().length >= 5,
        message: "Site description is invalid.",
      },
    },
    schoolPhoneNumber: {
      type: String,
      trim: true,
      maxlength: 13,
      default: "+639123456789",
      validate: {
        validator: (v) => phoneRegex.test(String(v || "").trim()),
        message:
          "School phone number must start with +63 and contain 10 digits after it.",
      },
    },
    schoolLocation: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "Dagupan City, Philippines",
      validate: {
        validator: (v) => typeof v === "string" && v.trim().length >= 3,
        message: "School location is invalid.",
      },
    },
  },
  { _id: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    general: {
      type: GeneralSettingsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);