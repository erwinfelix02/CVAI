import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  category: String,
  question: String,
  answer: String,
  role_visibility: [String],
  status: { type: String, default: "published" }
}, { timestamps: true });

export default mongoose.model("Faq", faqSchema);
