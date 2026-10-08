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

const AnnouncementSchema = new mongoose.Schema(
  {
    title: encryptedField("title"),
    course: encryptedField("course"), 
    subjectCode: { type: String, required: true, index: true }, 
    section: { type: String, default: "", index: true }, 
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    message: encryptedField("message"),
    scheduledDate: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["published", "scheduled", "draft"], 
      default: "published",
      index: true 
    },
    sendPush: { type: Boolean, default: true },
    sendEmail: { type: Boolean, default: false },
    recipients: { type: Number, default: 0 },
    facultyId: { type: String, required: true, index: true }, 
    author: encryptedField("author"),
    department: { type: String, required: true, index: true }, 
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        const d = doc.createdAt ? new Date(doc.createdAt) : new Date();
        ret.date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
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

AnnouncementSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

AnnouncementSchema.pre("save", function () {
  const encryptedPaths = ["title", "course", "message", "author"];
  ensureEncrypted(this, encryptedPaths);
});

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    title: "title",
    course: "course",
    message: "message",
    author: "author",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  AnnouncementSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);