import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    yearLevel: { type: String, required: true },
    program: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    room: { type: String, required: true },
    schedule: { type: String, required: true },
    adviser: { type: String, default: "TBA" },
    enrolled: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);

export default Section;