// ✅ src/models/Schedule.js

import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    days: {
      type: String,
      required: true,
      trim: true,
    },
    time: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
      trim: true,
    },

    // Tracking creation context
    department: { type: String, required: true, trim: true },
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      userName: { type: String, required: true, trim: true },
      userRole: { type: String, default: "Dept Head", trim: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Schedule ||
  mongoose.model("Schedule", ScheduleSchema);