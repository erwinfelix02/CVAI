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

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: encryptedField("name"), // Encrypted display name

    nameKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    }, // Unencrypted plain text used for unique lookups

    description: encryptedField("description"), // Encrypted description

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
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

departmentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// safer auto-normalization (keeping plain keys intact)
departmentSchema.pre("validate", function () {
  this.code = String(this.code || "").trim().toUpperCase();
  
  // Note: if name is modified, extract raw plain value for nameKey generation before encryption getters trigger
  const rawName = getRawValue(this, "name") || this.name;
  this.nameKey = String(rawName || "").trim().toLowerCase();
  
  this.status = String(this.status || "Active").trim();
});

// Middleware to ensure plain text fields are encrypted on save
departmentSchema.pre("save", function () {
  const encryptedPaths = ["name", "description"];
  ensureEncrypted(this, encryptedPaths);
});

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ nameKey: 1 }, { unique: true });

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    name: "name",
    description: "description",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  // Also auto-update nameKey if name is being updated
  if (target["name"] !== undefined) {
    // If target["name"] was passed as plain text in the update
    const plainName = isEncrypted(target["name"]) ? decrypt(target["name"]) : target["name"];
    if (plainName) {
      target["nameKey"] = String(plainName).trim().toLowerCase();
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  departmentSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);