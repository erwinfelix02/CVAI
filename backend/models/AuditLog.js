// backend/models/AuditLog.js

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    student: { type: String, required: true, trim: true },
    fromSection: { type: String, default: "—", trim: true },
    toSection: { type: String, required: true, trim: true },
    assignedBy: { type: String, required: true, trim: true },
    assignedAt: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

auditLogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

//  MongoDB TTL Index to automatically delete documents after 1 month (2,592,000 seconds / 30 days)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);