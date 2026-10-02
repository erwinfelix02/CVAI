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
    code: { type: String, required: true, unique: true, trim: true }, // Unencrypted unique reference key
    yearLevel: { type: String, required: true }, // Unencrypted for grouping/filtering
    program: { type: String, required: true }, // Unencrypted for program filtering
    capacity: { type: Number, required: true, min: 1 },
    room: { type: String, required: true }, // Unencrypted for room assignments/scheduling
    adviser: encryptedField("adviser"), // Encrypted adviser/faculty name
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
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save
sectionSchema.pre("save", function () {
  const encryptedPaths = ["adviser"];
  ensureEncrypted(this, encryptedPaths);
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    adviser: "adviser",
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

const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);

export default Section;