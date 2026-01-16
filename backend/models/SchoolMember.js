import mongoose from "mongoose";

const SchoolMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    schoolId: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["Student", "Faculty"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    courseOrDept: { type: String, required: true },
    yearOrPosition: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SchoolMember", SchoolMemberSchema);
