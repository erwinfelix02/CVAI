import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    preregistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Preregistration",
      required: true,
    },

    registrationId: { type: String, required: true },

    // ✅ REQUIRED for frontend list display (fix undefined studentName)
    studentName: { type: String, required: true },
    email: { type: String, required: true },

    // ✅ store prereg info (NO blockchain)
    personal: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: String,
      phone: String,
      birthDate: String,
      gender: String,
      address: String,
    },

    academic: {
      applicantType: String,
      course: String,
      previousSchool: String,
    },

    documents: {
      birthCert: String,
      form137: String,
      goodMoral: String,
      idPhoto: String,
    },

    // ✅ credentials (store what you need)
    credentials: {
      username: { type: String, default: "" },
      passwordHash: { type: String, default: "" },
      credentialsSentAt: { type: Date, default: null },
    },

    // ✅ schedule info
    schedule: {
      date: { type: String, required: true },
      time: { type: String, required: true },
      location: { type: String, required: true },
      notes: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: ["Scheduled", "Enrolled", "Cancelled"],
      default: "Scheduled",
    },

    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
