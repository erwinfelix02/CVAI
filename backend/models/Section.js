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

const sectionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    yearLevel: { type: String, required: true },
    program: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    room: encryptedField("room"),
    enrolled: { type: Number, default: 0 },
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

sectionSchema.virtual("id").get(function () {
  const hexId = this._id?.toHexString ? this._id.toHexString() : String(this._id || "");
  return hexId;
});

sectionSchema.pre("save", function () {
  const encryptedPaths = ["room"];
  ensureEncrypted(this, encryptedPaths);
});

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    room: "room",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  sectionSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

sectionSchema.post("aggregate", function (docs) {
  if (!Array.isArray(docs)) return;
  for (const doc of docs) {
    if (doc.room && typeof doc.room === "string" && isEncrypted(doc.room)) {
      doc.room = decrypt(doc.room);
    }
  }
});

const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);

export default Section;