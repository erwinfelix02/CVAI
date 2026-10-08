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

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true }, // Kept plain for unique index constraints
    name: encryptedField("name"), // Encrypted descriptive text
    yearLevels: { type: Number, required: true, min: 1, max: 10 },
    department: { type: String, required: true, trim: true }, // Kept plain for filtering/grouping
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ blockchain tracking
    chainIndex: { type: Number, default: null }, // index in contract array
    chainTxHash: { type: String, default: "" },  // last tx hash
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

courseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure plain text fields are encrypted on save
courseSchema.pre("save", function () {
  const rawName = getRawValue(this, "name");
  if (rawName && !isEncrypted(rawName)) {
    this.set("name", rawName);
  }
});

// Middleware to handle updates safely
function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  if (target["name"] !== undefined) {
    target["name"] = encrypt(normalizeForStorage("name", target["name"]));
  }

  if (update.$set) update.$set = target;
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  courseSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Course ||
  mongoose.model("Course", courseSchema);