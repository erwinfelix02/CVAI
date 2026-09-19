import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  studentNo: { type: String, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "late", "pending"],
    default: "pending",
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true },
    facultyName: { type: String, required: true },
    subject: { type: String, required: true }, // Course Code
    section: { type: String, default: "" },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    isRecorded: { type: Boolean, default: true },
    students: [studentAttendanceSchema],
  },
  { timestamps: true }
);

// Prevent duplicate records for the same subject, faculty, and date
attendanceSchema.index(
  { facultyId: 1, subject: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;