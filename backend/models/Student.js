import mongoose from "mongoose";

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
    section: { type: String, default: "", trim: true },
    department: { type: String, required: true, trim: true },
    enrolledSubjects: { type: [String], default: [] },
    notes: { type: String, default: "" },
    verifiedDocs: { type: [String], default: [] },
    facultyId: { type: String, default: "", index: true },
    facultyName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" }, // 👈 Added avatarUrl field
    status: {
      type: String,
      enum: ["Active", "Inactive", "Dropped", "Graduated"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);