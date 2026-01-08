import mongoose from "mongoose";

const SchoolMemberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  schoolId: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["student", "faculty"],
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
});

export default mongoose.model("SchoolMember", SchoolMemberSchema);
