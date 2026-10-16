// models/SectionRequest.js
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

const sectionRequestSchema = new mongoose.Schema(
  {
    department: { type: String, required: true }, // e.g., "College of Information Technology"
    program: { type: String, required: true },    // e.g., "BSIT"
    yearLevel: { type: Number, required: true },  // e.g., 2
    sectionName: { type: String, required: true }, // e.g., "BSIT 2A"
    requestedCapacity: { type: Number, default: 40 },
    preferredRoom: { type: String, required: true }, // e.g., "Room 301"
    reason: { type: String, required: true },     // e.g., "High volume of transferee students"
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

sectionRequestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save if configured
sectionRequestSchema.pre("save", function () {
  const encryptedPaths = [];
  ensureEncrypted(this, encryptedPaths);
});

const SectionRequest = mongoose.models.SectionRequest || mongoose.model("SectionRequest", sectionRequestSchema);

export default SectionRequest;