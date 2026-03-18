import mongoose from "mongoose";

const ReservedIdSchema = new mongoose.Schema(
  {
    idNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // what type of entity this ID is for
    type: {
      type: String,
      required: true,
      enum: ["student", "faculty", "user"],
      index: true,
    },

    // optional reference (for enrollment flow)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    used: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.ReservedId ||
  mongoose.model("ReservedId", ReservedIdSchema);