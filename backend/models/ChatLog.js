import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      required: true,
    },
    cached: {
      type: Boolean,
      default: false,
    },
    follow_up: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for faster history lookups
chatLogSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
chatLogSchema.index({ userId: 1, createdAt: 1 });

export default mongoose.model("ChatLog", chatLogSchema);