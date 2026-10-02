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

const studentAttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: encryptedField("students.name"),
  studentNo: { type: String, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "late", "pending"],
    default: "pending",
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, index: true },
    facultyName: encryptedField("facultyName"),
    subject: { type: String, required: true }, // Course Code
    section: { type: String, default: "" },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    isRecorded: { type: Boolean, default: true },
    students: [studentAttendanceSchema],
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

attendanceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Prevent duplicate records for the same subject, faculty, and date
attendanceSchema.index(
  { facultyId: 1, subject: 1, date: 1 },
  { unique: true }
);

// Middleware to ensure all descriptive/PII fields are encrypted on save
attendanceSchema.pre("save", function () {
  // Check top-level encrypted field
  const rawFacultyName = getRawValue(this, "facultyName");
  if (rawFacultyName && !isEncrypted(rawFacultyName)) {
    this.set("facultyName", rawFacultyName);
  }

  // Check subdocument array fields (student names)
  if (this.students && Array.isArray(this.students)) {
    for (const student of this.students) {
      const rawStudentName = student.get("name", null, { getters: false });
      if (rawStudentName && !isEncrypted(rawStudentName)) {
        student.set("name", rawStudentName);
      }
    }
  }
});

// Middleware to handle top-level updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  if (target["facultyName"] !== undefined) {
    target["facultyName"] = encrypt(normalizeForStorage("facultyName", target["facultyName"]));
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  attendanceSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;