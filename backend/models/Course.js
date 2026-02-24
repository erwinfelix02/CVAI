import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    yearLevels: { type: Number, required: true, min: 1, max: 10 },
    department: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ blockchain tracking
    chainIndex: { type: Number, default: null }, // index in contract array
    chainTxHash: { type: String, default: "" },  // last tx hash
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);