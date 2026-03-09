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
      trim: true,
      lowercase: true,
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

// safer auto-normalization
departmentSchema.pre("validate", function () {
  this.code = String(this.code || "").trim().toUpperCase();
  this.name = String(this.name || "").trim();
  this.nameKey = String(this.name || "").trim().toLowerCase();
  this.description = String(this.description || "").trim();
  this.status = String(this.status || "Active").trim();
});

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ nameKey: 1 }, { unique: true });

export default mongoose.models.Department ||
  mongoose.model("Department", departmentSchema);