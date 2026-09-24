// ✅ models/Ticket.js
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    studentIdNumber: { type: String, required: true, trim: true },
    categoryKey: { type: String, required: true, trim: true },
    priority: { type: String, enum: ["Low", "Normal", "High", "Urgent"], default: "Normal" },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);