// ✅ models/Task.js
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

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    dateKey: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    text: encryptedField("text"),
    completed: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
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
  },
);

taskSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

taskSchema.pre("save", function () {
  const encryptedPaths = ["text"];
  ensureEncrypted(this, encryptedPaths);
});

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    text: "text",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  taskSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Task ||
  mongoose.model("Task", taskSchema);