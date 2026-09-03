import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    units: { type: Number, required: true, min: 1, max: 10 },
    year: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    faculty: { type: String, default: "", trim: true },
    department: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);