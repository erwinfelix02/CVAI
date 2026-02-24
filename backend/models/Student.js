import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    registrationId: {
      type: String,
      required: true,
      unique: true, // ✅ add this (recommended)
      index: true,
      trim: true,
    },

    fullName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    birthdate: { type: Date, required: true },

    guardian: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },

    program: { type: String, required: true, trim: true },
    yearLevel: { type: Number, required: true },
    department: { type: String, required: true, trim: true },

    notes: { type: String, default: "" },
    verifiedDocs: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);