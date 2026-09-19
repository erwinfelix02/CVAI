import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true }, // Display name e.g., "CS 101 - Intro to CS (BSCS 3A)"
    subjectCode: { type: String, required: true, index: true }, // e.g., "CS 101"
    section: { type: String, default: "", index: true }, // e.g., "BSCS 3A"
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    message: { type: String, required: true },
    scheduledDate: { type: String, default: "" },
    sendPush: { type: Boolean, default: true },
    sendEmail: { type: Boolean, default: false },
    recipients: { type: Number, default: 0 },
    facultyId: { type: String, required: true, index: true },
    author: { type: String, default: "Faculty Member" },
    department: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

AnnouncementSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

AnnouncementSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    const d = doc.createdAt ? new Date(doc.createdAt) : new Date();
    ret.date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);