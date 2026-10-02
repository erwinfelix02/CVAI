// backend/models/Student.js

import mongoose from "mongoose";
import {
  encrypt,
  decrypt,
  isEncrypted,
  hashLookup,
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

function getRawNested(doc, path) {
  return doc.get(path, null, { getters: false });
}

function getPlainNested(doc, path) {
  return decrypt(getRawNested(doc, path));
}

function ensureEncrypted(doc, paths) {
  for (const path of paths) {
    const raw = getRawNested(doc, path);
    if (raw === undefined || raw === null || raw === "") continue;

    if (!isEncrypted(raw)) {
      doc.set(path, raw);
    }
  }
}

function isOperatorObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => key.startsWith("$"))
  );
}

const termGradeSchema = new mongoose.Schema(
  {
    quizzes: { type: mongoose.Schema.Types.Mixed, default: "" },
    activities: { type: mongoose.Schema.Types.Mixed, default: "" },
    examination: { type: mongoose.Schema.Types.Mixed, default: "" },
    grade: { type: mongoose.Schema.Types.Mixed, default: "—" },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    studentIdNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    fullName: encryptedField("fullName"),
    email: encryptedField("email"),
    phone: encryptedField("phone"),
    address: encryptedField("address"),
    birthdate: encryptedField("birthdate"),
    guardian: encryptedField("guardian"),
    guardianPhone: encryptedField("guardianPhone"),
    
    program: { type: String, required: true, trim: true },
    yearLevel: { type: Number, required: true },
    section: { type: String, default: "", trim: true },
    department: { type: String, required: true, trim: true },
    enrolledSubjects: { type: [String], default: [] },
    
    // Dynamic Grades storage per subject code with explicitly allowed fields
    grades: {
      type: Map,
      of: new mongoose.Schema({
        prelim: termGradeSchema,
        midterm: termGradeSchema,
        finals: termGradeSchema,
        finalGrade: { type: mongoose.Schema.Types.Mixed, default: "—" },
        status: { type: String, default: "pending" },
        academicYear: { type: String, default: "" },       // 👈 Added field
        semester: { type: String, default: "" },           // 👈 Added field
        studentYearLevel: { type: Number, default: 1 },    // 👈 Added field
        updatedByFaculty: String,
        updatedAt: { type: Date, default: Date.now },
      }, { _id: false }),
    },

    notes: encryptedField("notes"),
    verifiedDocs: { type: [String], default: [] },
    facultyId: { type: String, default: "", index: true },
    facultyName: encryptedField("facultyName"),
    avatarUrl: { type: String, default: "" },

    emailHash: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      select: false,
    },
    phoneHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Dropped", "Graduated"],
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

studentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

studentSchema.pre("save", function () {
  const encryptedPaths = [
    "fullName",
    "email",
    "phone",
    "address",
    "birthdate",
    "guardian",
    "guardianPhone",
    "notes",
    "facultyName",
  ];

  ensureEncrypted(this, encryptedPaths);

  const email = getPlainNested(this, "email");
  const phone = getPlainNested(this, "phone");

  if (email) this.emailHash = hashLookup("email", email);
  if (phone) this.phoneHash = hashLookup("phone", phone);
});

function rewriteLookupFilter(filter) {
  if (!filter || typeof filter !== "object") return;

  for (const logical of ["$or", "$and", "$nor"]) {
    if (Array.isArray(filter[logical])) {
      filter[logical].forEach(rewriteLookupFilter);
    }
  }

  if ("email" in filter && !isOperatorObject(filter["email"])) {
    filter.emailHash = hashLookup("email", filter["email"]);
    delete filter["email"];
  }

  if ("phone" in filter && !isOperatorObject(filter["phone"])) {
    filter.phoneHash = hashLookup("phone", filter["phone"]);
    delete filter["phone"];
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    fullName: "fullName",
    email: "email",
    phone: "phone",
    address: "address",
    birthdate: "birthdate",
    guardian: "guardian",
    guardianPhone: "guardianPhone",
    notes: "notes",
    facultyName: "facultyName",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  const plainEmail =
    target["email"] !== undefined ? decrypt(target["email"]) : undefined;
  const plainPhone =
    target["phone"] !== undefined ? decrypt(target["phone"]) : undefined;

  if (plainEmail !== undefined) {
    target.emailHash = hashLookup("email", plainEmail);
  }
  if (plainPhone !== undefined) {
    target.phoneHash = hashLookup("phone", plainPhone);
  }

  if (update.$set) update.$set = target;
}

for (const hook of [
  "find",
  "findOne",
  "countDocuments",
  "findOneAndUpdate",
  "updateOne",
  "updateMany",
]) {
  studentSchema.pre(hook, function () {
    rewriteLookupFilter(this.getFilter());
  });
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  studentSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

const encryptedFieldsList = [
  "fullName",
  "email",
  "phone",
  "address",
  "birthdate",
  "guardian",
  "guardianPhone",
  "notes",
  "facultyName",
];

function decryptDoc(doc) {
  if (!doc || typeof doc !== "object") return doc;
  for (const field of encryptedFieldsList) {
    if (doc[field] && typeof doc[field] === "string" && isEncrypted(doc[field])) {
      doc[field] = decrypt(doc[field]);
    }
  }
  if (doc._id && !doc.id) {
    doc.id = doc._id.toString();
  }
  return doc;
}

studentSchema.post(["find", "findOne"], function (result) {
  if (!result) return;
  if (Array.isArray(result)) {
    result.forEach(decryptDoc);
  } else {
    decryptDoc(result);
  }
});

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);