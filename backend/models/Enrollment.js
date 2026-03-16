import mongoose from "mongoose";
import {
  encrypt,
  decrypt,
  isEncrypted,
  normalizeForStorage,
} from "../utils/fieldCrypto.js";

function encryptedField(fieldName, extra = {}) {
  return {
    type: String,
    ...extra,
    get: (value) => decrypt(value),
    set: (value) => {
      if (value === undefined || value === null || value === "") return value;
      return encrypt(normalizeForStorage(fieldName, value));
    },
  };
}

function getRawNested(doc, path) {
  return doc.get(path, null, { getters: false });
}

function ensureEncryptedNested(doc, paths) {
  for (const path of paths) {
    const raw = getRawNested(doc, path);
    if (raw === undefined || raw === null || raw === "") continue;

    if (!isEncrypted(raw)) {
      doc.set(path, raw);
    }
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;

  const encryptMap = {
    studentName: "studentName",
    email: "email",

    "personal.firstName": "personal.firstName",
    "personal.middleName": "personal.middleName",
    "personal.lastName": "personal.lastName",
    "personal.email": "personal.email",
    "personal.phone": "personal.phone",
    "personal.address": "personal.address",
    "personal.birthdate": "personal.birthdate",
    "personal.guardian": "personal.guardian",
    "personal.guardianPhone": "personal.guardianPhone",
    "personal.gender": "personal.gender",

    "academic.program": "academic.program",
    "academic.yearLevel": "academic.yearLevel",
    "academic.department": "academic.department",
    "academic.applicantType": "academic.applicantType",
    "academic.previousSchool": "academic.previousSchool",

    evaluationNotes: "evaluationNotes",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  if (update.$set) {
    update.$set = target;
  }
}

const enrollmentSchema = new mongoose.Schema(
  {
    preregistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Preregistration",
      required: true,
    },

    registrationId: { type: String, required: true },

    studentName: encryptedField("studentName", { required: true }),
    email: encryptedField("email", { required: true }),

    studentIdNumber: { type: String, default: "" },

    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    personal: {
      firstName: encryptedField("personal.firstName"),
      middleName: encryptedField("personal.middleName"),
      lastName: encryptedField("personal.lastName"),
      email: encryptedField("personal.email"),
      phone: encryptedField("personal.phone"),
      address: encryptedField("personal.address"),
      birthdate: encryptedField("personal.birthdate"),
      guardian: encryptedField("personal.guardian"),
      guardianPhone: encryptedField("personal.guardianPhone"),
      gender: encryptedField("personal.gender"),
    },

    academic: {
      program: encryptedField("academic.program"),
      yearLevel: encryptedField("academic.yearLevel"),
      department: encryptedField("academic.department"),
      applicantType: encryptedField("academic.applicantType"),
      previousSchool: encryptedField("academic.previousSchool"),
    },

    documents: {
      birthCert: String,
      form137: String,
      goodMoral: String,
      idPhoto: String,
    },

    credentials: {
      username: { type: String, default: "" },
      passwordHash: { type: String, default: "" },
      credentialsSentAt: { type: Date, default: null },
    },

    credentialsSent: { type: Boolean, default: false },

    schedule: {
      date: { type: String },
      time: { type: String },
      location: { type: String },
      notes: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["Scheduled", "Enrolled", "Cancelled", "Archived"],
      default: "Scheduled",
    },

    archivedFromStatus: {
      type: String,
      enum: ["Scheduled", "Enrolled", "Cancelled", ""],
      default: "",
    },

    archivedAt: { type: Date, default: null },

    verifiedDocs: { type: [String], default: [] },
    evaluationNotes: encryptedField("evaluationNotes", { default: "" }),
    evaluatedAt: { type: Date, default: null },

    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      versionKey: false,
    },
    toObject: {
      getters: true,
      versionKey: false,
    },
  },
);

enrollmentSchema.pre("save", function () {
  const encryptedPaths = [
    "studentName",
    "email",

    "personal.firstName",
    "personal.middleName",
    "personal.lastName",
    "personal.email",
    "personal.phone",
    "personal.address",
    "personal.birthdate",
    "personal.guardian",
    "personal.guardianPhone",
    "personal.gender",

    "academic.program",
    "academic.yearLevel",
    "academic.department",
    "academic.applicantType",
    "academic.previousSchool",

    "evaluationNotes",
  ];

  ensureEncryptedNested(this, encryptedPaths);
});

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  enrollmentSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", enrollmentSchema);