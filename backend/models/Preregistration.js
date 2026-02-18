// models/Preregistration.js
import mongoose from "mongoose";

function generateRegistrationId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PR-${year}-${random}`;
}

const preregSchema = new mongoose.Schema(
  {
    blockchainTxHash: String,

    registrationId: { type: String, unique: true },

    personal: {
      firstName: String,
      middleName: String,
      lastName: String,
      email: { type: String, index: true },
      phone: { type: String, index: true },
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

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    scheduleSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

preregSchema.pre("save", function () {
  if (!this.registrationId) this.registrationId = generateRegistrationId();
});

// ✅ optional but strong: unique email + phone (sparse lets nulls exist)
preregSchema.index({ "personal.email": 1 }, { unique: true, sparse: true });
preregSchema.index({ "personal.phone": 1 }, { unique: true, sparse: true });

export default mongoose.model("Preregistration", preregSchema);
