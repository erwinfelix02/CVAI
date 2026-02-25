import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    preregistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Preregistration",
      required: true,
    },

    registrationId: { type: String, required: true },

    studentName: { type: String, required: true },
    email: { type: String, required: true },

    studentIdNumber: { type: String, default: "" },

    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    personal: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      birthdate: String,
      guardian: String,
      guardianPhone: String,
      gender: String,
    },

    academic: {
      program: String,
      yearLevel: String,
      department: String,
      applicantType: String,
      previousSchool: String,
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

    // ✅ ONE ONLY
    credentialsSent: { type: Boolean, default: false },

    schedule: {
      date: { type: String },
      time: { type: String },
      location: { type: String },
      notes: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["Scheduled", "Enrolled", "Cancelled"],
      default: "Scheduled",
    },

    verifiedDocs: { type: [String], default: [] },
    evaluationNotes: { type: String, default: "" },
    evaluatedAt: { type: Date, default: null },

    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Enrollment", enrollmentSchema);