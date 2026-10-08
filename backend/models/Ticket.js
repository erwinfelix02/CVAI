// src/models/Ticket.js

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

const TicketSchema = new mongoose.Schema(
  {
    email: encryptedField("email"), // Encrypted email
    name: encryptedField("name"), // Encrypted sender name
    idNumber: encryptedField("idNumber"), // 👈 Changed to encryptedField so it aligns with User model encryption & getters
    categoryKey: { type: String, required: true, trim: true, index: true }, // Unencrypted for categorization filtering
    priority: { type: String, enum: ["Low", "Normal", "High", "Urgent"], default: "Normal", index: true },
    subject: encryptedField("subject"), // Encrypted ticket subject
    description: encryptedField("description"), // Encrypted ticket description
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open", index: true },
    
    emailHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },
    idNumberHash: { // 👈 Added lookup hash support for searching tickets by ID number if needed
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
      getters: true, // 👈 Ensures decryption runs automatically when sending JSON responses
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      getters: true, // 👈 Ensures decryption runs automatically when converting to objects
      virtuals: true,
      versionKey: false,
    },
  }
);

TicketSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Middleware to ensure encrypted fields and hashes are handled on save
TicketSchema.pre("save", function () {
  const encryptedPaths = ["email", "name", "idNumber", "subject", "description"];
  ensureEncrypted(this, encryptedPaths);

  const email = getPlainValue(this, "email");
  if (email) {
    this.emailHash = hashLookup("email", email);
  }

  const idNumber = getPlainValue(this, "idNumber");
  if (idNumber) {
    this.idNumberHash = hashLookup("idNumber", idNumber);
  }
});

// Query rewriting for lookup filters
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

  if ("idNumber" in filter && !isOperatorObject(filter["idNumber"])) {
    filter.idNumberHash = hashLookup("idNumber", filter["idNumber"]);
    delete filter["idNumber"];
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;
  const encryptMap = {
    email: "email",
    name: "name",
    idNumber: "idNumber",
    subject: "subject",
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

  const plainIdNumber =
    target["idNumber"] !== undefined ? decrypt(target["idNumber"]) : undefined;
  if (plainIdNumber !== undefined) {
    target.idNumberHash = hashLookup("idNumber", plainIdNumber);
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
  TicketSchema.pre(hook, function () {
    rewriteLookupFilter(this.getFilter());
  });
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  TicketSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);