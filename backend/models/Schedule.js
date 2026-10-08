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

const ScheduleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true }, // Unencrypted reference code
    title: encryptedField("title"), // Encrypted schedule title
    faculty: encryptedField("faculty"), // Encrypted faculty member name
    room: { type: String, required: true, trim: true }, // Unencrypted for room booking/conflict checks
    section: { type: String, required: true, trim: true }, // Unencrypted for section filtering
    days: {
      type: String,
      required: true,
      trim: true,
    }, // Unencrypted for schedule rendering/conflicts
    time: { type: String, required: true, trim: true }, // Unencrypted for schedule rendering/conflicts
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
      trim: true,
    },

    // Tracking creation context
    department: { type: String, required: true, trim: true }, // Unencrypted for department filtering
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      userName: encryptedField("createdBy.userName"), // Encrypted creator name
      userRole: { type: String, default: "Dept Head", trim: true },
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

ScheduleSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save
ScheduleSchema.pre("save", function () {
  const encryptedPaths = ["title", "faculty", "createdBy.userName"];
  ensureEncrypted(this, encryptedPaths);
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    title: "title",
    faculty: "faculty",
    "createdBy.userName": "createdBy.userName",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  ScheduleSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Schedule ||
  mongoose.model("Schedule", ScheduleSchema);