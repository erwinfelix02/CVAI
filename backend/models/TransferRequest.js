// ✅ models/TransferRequest.js
import mongoose from "mongoose";
import {
  encrypt,
  decrypt,
  isEncrypted,
  normalizeForStorage,
} from "../utils/fieldCrypto.js";

function encryptedField(fieldName) {
  return {
    type: String,
    get: (value) => decrypt(value),
    set: (value) => {
      if (value === undefined || value === null || value === "") return value;
      return encrypt(normalizeForStorage(fieldName, value));
    },
  };
}

function getRawValue(doc, path) {
  return doc.get(path, null, { getters: false });
}

const transferRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["transfer", "drop"],
      default: "transfer",
    },
    transferType: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    currentDepartment: { type: String, required: true, trim: true },
    currentCourse: encryptedField("currentCourse"),
    targetDepartment: { type: String, required: true, trim: true },
    targetCourse: encryptedField("targetCourse"),
    status: {
      type: String,
      enum: ["Pending", "Approved", "Returned", "Rejected"],
      default: "Pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: encryptedField("reason"),
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      getters: true,
      versionKey: false,
    },
  }
);

transferRequestSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

transferRequestSchema.pre("save", function () {
  for (const field of ["currentCourse", "targetCourse", "reason"]) {
    const rawVal = getRawValue(this, field);
    if (rawVal && !isEncrypted(rawVal)) {
      this.set(field, rawVal);
    }
  }
});

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  for (const field of ["currentCourse", "targetCourse", "reason"]) {
    if (target[field] !== undefined && target[field] !== null && target[field] !== "") {
      if (!isEncrypted(target[field])) {
        target[field] = encrypt(normalizeForStorage(field, target[field]));
      }
    }
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  transferRequestSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.TransferRequest ||
  mongoose.model("TransferRequest", transferRequestSchema);