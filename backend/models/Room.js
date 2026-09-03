import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["Lecture", "Laboratory"],
    },
    seats: { type: Number, required: true, min: 1 },
    classes: { type: Number, default: 0 },
    utilization: { type: Number, default: 0, min: 0, max: 100 },
    department: { type: String, required: true, trim: true }, // Tied to Dept Head's department
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model("Room", roomSchema);