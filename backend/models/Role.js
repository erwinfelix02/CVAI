import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);