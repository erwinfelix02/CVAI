import mongoose from "mongoose";
import {
  encrypt,
  decrypt,
  isEncrypted,
  hashLookup,
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

function getPlainValue(doc, path) {
  return decrypt(getRawValue(doc, path));
}

function ensureEncrypted(doc, paths) {
  for (const path of paths) {
    const raw = getRawValue(doc, path);
    if (raw === undefined || raw === null || raw === "") continue;

    if (!isEncrypted(raw)) {
      doc.set(path, raw);
    }
  }
}

function isOperatorObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => key.startsWith("$"))
  );
}

const todoSchema = new mongoose.Schema(
  {
    email: encryptedField("email"), // Encrypted user email
    role: { type: String, required: true }, // Unencrypted for role filtering
    title: encryptedField("title"), // Encrypted todo title
    description: encryptedField("description"), // Encrypted todo description
    dueDate: { type: Date, required: true, index: true }, // Unencrypted for date filtering and background reminder jobs
    completed: { type: Boolean, default: false, index: true },
    
    // Multi-tier reminder flags
    reminder24hSent: { type: Boolean, default: false },
    reminder5hSent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false },

    emailHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },
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

todoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure encrypted fields and email hash are handled on save
todoSchema.pre("save", function () {
  const encryptedPaths = ["email", "title", "description"];
  ensureEncrypted(this, encryptedPaths);

  const email = getPlainValue(this, "email");
  if (email) {
    this.emailHash = hashLookup("email", email);
  }
});

// Query rewriting for lookup filters (e.g., querying todos by email)
function rewriteLookupFilter(filter) {
  if (!filter || typeof filter !== "object") return;

  for (const logical of ["$or", "$and", "$nor"]) {
    if (Array.isArray(filter[logical])) {
      filter[logical].forEach(rewriteLookupFilter);
    }
  }

  if ("email" in filter && !isOperatorObject(filter["email"])) {
    filter.emailHash = hashLookup("email", filter["email"]);
    delete filter["email"];
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    email: "email",
    title: "title",
    description: "description",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
  }

  const plainEmail =
    target["email"] !== undefined ? decrypt(target["email"]) : undefined;

  if (plainEmail !== undefined) {
    target.emailHash = hashLookup("email", plainEmail);
  }

  if (update.$set) update.$set = target;
}

for (const hook of [
  "find",
  "findOne",
  "countDocuments",
  "findOneAndUpdate",
  "updateOne",
  "updateMany",
]) {
  todoSchema.pre(hook, function () {
    rewriteLookupFilter(this.getFilter());
  });
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  todoSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Todo || mongoose.model("Todo", todoSchema);