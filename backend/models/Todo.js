// models/Todo.js
import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  role: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  // Multi-tier reminder flags
  reminder24hSent: { type: Boolean, default: false },
  reminder5hSent: { type: Boolean, default: false },
  reminder1hSent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Todo", todoSchema);