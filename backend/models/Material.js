import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["pdf", "doc", "video"],
      required: true,
      default: "pdf",
    },
    description: { type: String, trim: true, default: "" },
    filePath: { type: String, required: true },
    sizeLabel: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    facultyId: { type: String, required: true, trim: true },
    uploadedBy: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);