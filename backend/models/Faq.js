import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    category: String,
    question: String,
    answer: String,
    role_visibility: [String],
    status: {
      type: String,
      default: "published",
    },
  },
  { timestamps: true }
);

// Index for faster FAQ lookup
faqSchema.index({ role_visibility: 1, status: 1 });

export default mongoose.model("Faq", faqSchema);