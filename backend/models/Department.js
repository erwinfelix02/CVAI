import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    nameKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

departmentSchema.pre("validate", function (next) {
  this.code = String(this.code || "").trim().toUpperCase();
  this.name = String(this.name || "").trim();
  this.nameKey = this.name.toLowerCase();
  next();
});

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ nameKey: 1 }, { unique: true });

export default mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);