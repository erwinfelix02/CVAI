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

const materialSchema = new mongoose.Schema(
  {
    title: encryptedField("title"), // Encrypted material title
    course: { type: String, required: true, trim: true }, // Unencrypted for course filtering
    type: {
      type: String,
      enum: ["pdf", "doc", "video"],
      required: true,
      default: "pdf",
    },
    description: encryptedField("description"), // Encrypted material description
    filePath: { type: String, required: true }, // Unencrypted system file path
    sizeLabel: { type: String, required: true }, // Unencrypted file size display string
    downloads: { type: Number, default: 0 }, // Unencrypted counter
    facultyId: { type: String, required: true, trim: true }, // Unencrypted filter key
    uploadedBy: encryptedField("uploadedBy"), // Encrypted uploader name
    department: { type: String, required: true, trim: true }, // Unencrypted filter key
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

materialSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save
materialSchema.pre("save", function () {
  const encryptedPaths = ["title", "description", "uploadedBy"];
  ensureEncrypted(this, encryptedPaths);
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    title: "title",
    description: "description",
    uploadedBy: "uploadedBy",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  materialSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);