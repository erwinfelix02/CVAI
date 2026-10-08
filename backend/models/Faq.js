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

const faqSchema = new mongoose.Schema(
  {
    category: { type: String, default: "" }, // Unencrypted for category filtering/indexing
    question: encryptedField("question"), // Encrypted FAQ question
    answer: encryptedField("answer"), // Encrypted FAQ answer
    status: {
      type: String,
      default: "published",
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

faqSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Index for status and category filtering
faqSchema.index({ status: 1, category: 1 });

// Middleware to ensure plain text fields are encrypted on save
faqSchema.pre("save", function () {
  const encryptedPaths = ["question", "answer"];
  ensureEncrypted(this, encryptedPaths);
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    question: "question",
    answer: "answer",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  faqSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Faq ||
  mongoose.model("Faq", faqSchema);