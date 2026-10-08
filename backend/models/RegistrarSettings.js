import mongoose from "mongoose";
import {
  encrypt,
  decrypt,
  isEncrypted,
  normalizeForStorage,
} from "../utils/fieldCrypto.js";

function encryptedField(fieldName) {
  return {
    type: String,
    get: (value) => decrypt(value),
    set: (value) => {
      if (value === undefined || value === null || value === "") return value;
      return encrypt(normalizeForStorage(fieldName, value));
    },
  };
}

function getRawValue(doc, path) {
  return doc.get(path, null, { getters: false });
}

function ensureEncrypted(doc, paths) {
  for (const path of paths) {
    const raw = getRawValue(doc, path);
    if (raw === undefined || raw === null || raw === "") continue;

    if (!isEncrypted(raw)) {
      doc.set(path, raw);
    }
  }
}

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
    archiveRetentionDays: { type: Number, default: 30, min: 1 },

    updatedBy: encryptedField("updatedBy"), // Encrypted user updater field
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      getters: true,
      versionKey: false,
    },
  }
);

registrarSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save
registrarSettingsSchema.pre("save", function () {
  const encryptedPaths = ["updatedBy"];
  ensureEncrypted(this, encryptedPaths);
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    updatedBy: "updatedBy",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  registrarSettingsSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.RegistrarSettings ||
  mongoose.model("RegistrarSettings", registrarSettingsSchema);