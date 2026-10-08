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

const gradingComponentSchema = new mongoose.Schema(
  {
    quizzes: { type: Number, default: 20 },
    activities: { type: Number, default: 50 },
    examination: { type: Number, default: 30 },
  },
  { _id: false },
);

const gradingSystemSchema = new mongoose.Schema(
  {
    subjectType: { type: String, default: "Laboratory" },
    termWeights: {
      prelim: { type: Number, default: 30 },
      midterm: { type: Number, default: 30 },
      finals: { type: Number, default: 40 },
    },
    components: {
      prelim: { type: gradingComponentSchema, default: () => ({}) },
      midterm: { type: gradingComponentSchema, default: () => ({}) },
      finals: { type: gradingComponentSchema, default: () => ({}) },
    },
  },
  { _id: false },
);

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: encryptedField("name"),
    units: { type: Number, required: true, min: 1, max: 4 },
    year: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    faculty: encryptedField("faculty"),
    department: { type: String, required: true, trim: true },
    gradingSystem: {
      type: gradingSystemSchema,
      default: null, // Default to null so we can check if it's unconfigured
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
  },
);

subjectSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subjectSchema.pre("save", function () {
  const encryptedPaths = ["name", "faculty"];
  ensureEncrypted(this, encryptedPaths);
});

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    name: "name",
    faculty: "faculty",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  subjectSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Subject ||
  mongoose.model("Subject", subjectSchema);
