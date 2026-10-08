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

function getRawNested(doc, path) {
  return doc.get(path, null, { getters: false });
}

function getPlainNested(doc, path) {
  return decrypt(getRawNested(doc, path));
}

function ensureEncryptedNested(doc, paths) {
  for (const path of paths) {
    const raw = getRawNested(doc, path);
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

const archivedPreregSchema = new mongoose.Schema(
  {
    blockchainTxHash: String,

    registrationId: { type: String, unique: true },

    personal: {
      firstName: encryptedField("personal.firstName"),
      middleName: encryptedField("personal.middleName"),
      lastName: encryptedField("personal.lastName"),
      email: encryptedField("personal.email"),
      phone: encryptedField("personal.phone"),
      birthDate: encryptedField("personal.birthDate"),
      gender: encryptedField("personal.gender"),
      address: encryptedField("personal.address"),
    },

    academic: {
      applicantType: encryptedField("academic.applicantType"),
      course: encryptedField("academic.course"),
      previousSchool: encryptedField("academic.previousSchool"),
    },

    documents: {
      birthCert: String,
      form137: String,
      goodMoral: String,
      idPhoto: String,
    },

    emailHash: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      select: false,
    },

    phoneHash: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      select: false,
    },

    applicantIdentityHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },

    status: {
      type: String,
      enum: ["Archived"],
      default: "Archived",
    },

    originalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Rejected",
    },

    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    scheduleSentAt: { type: Date, default: null },
    archivedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      versionKey: false,
    },
    toObject: {
      getters: true,
      versionKey: false,
    },
  },
);

archivedPreregSchema.index(
  { applicantIdentityHash: 1 },
  { unique: true, sparse: true },
);

archivedPreregSchema.pre("save", function () {
  const encryptedPaths = [
    "personal.firstName",
    "personal.middleName",
    "personal.lastName",
    "personal.email",
    "personal.phone",
    "personal.birthDate",
    "personal.gender",
    "personal.address",
    "academic.applicantType",
    "academic.course",
    "academic.previousSchool",
  ];

  ensureEncryptedNested(this, encryptedPaths);

  const email = getPlainNested(this, "personal.email");
  const phone = getPlainNested(this, "personal.phone");
  const firstName = getPlainNested(this, "personal.firstName");
  const lastName = getPlainNested(this, "personal.lastName");
  const birthDate = getPlainNested(this, "personal.birthDate");

  this.emailHash = hashLookup("personal.email", email);
  this.phoneHash = hashLookup("personal.phone", phone);

  const identityBase = [
    String(firstName || "").trim().toLowerCase(),
    String(lastName || "").trim().toLowerCase(),
    String(birthDate || "").trim(),
  ].join("|");

  this.applicantIdentityHash = identityBase.includes("||")
    ? undefined
    : hashLookup("applicantIdentity", identityBase);
});

function rewriteLookupFilter(filter) {
  if (!filter || typeof filter !== "object") return;

  for (const logical of ["$or", "$and", "$nor"]) {
    if (Array.isArray(filter[logical])) {
      filter[logical].forEach(rewriteLookupFilter);
    }
  }

  if (
    "personal.email" in filter &&
    !isOperatorObject(filter["personal.email"])
  ) {
    filter.emailHash = hashLookup("personal.email", filter["personal.email"]);
    delete filter["personal.email"];
  }

  if (
    "personal.phone" in filter &&
    !isOperatorObject(filter["personal.phone"])
  ) {
    filter.phoneHash = hashLookup("personal.phone", filter["personal.phone"]);
    delete filter["personal.phone"];
  }

  const hasIdentityFields =
    "personal.firstName" in filter &&
    "personal.lastName" in filter &&
    "personal.birthDate" in filter &&
    !isOperatorObject(filter["personal.firstName"]) &&
    !isOperatorObject(filter["personal.lastName"]) &&
    !isOperatorObject(filter["personal.birthDate"]);

  if (hasIdentityFields) {
    const base = [
      String(filter["personal.firstName"] || "").trim().toLowerCase(),
      String(filter["personal.lastName"] || "").trim().toLowerCase(),
      String(filter["personal.birthDate"] || "").trim(),
    ].join("|");

    filter.applicantIdentityHash = hashLookup("applicantIdentity", base);

    delete filter["personal.firstName"];
    delete filter["personal.lastName"];
    delete filter["personal.birthDate"];
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;

  const encryptMap = {
    "personal.firstName": "personal.firstName",
    "personal.middleName": "personal.middleName",
    "personal.lastName": "personal.lastName",
    "personal.email": "personal.email",
    "personal.phone": "personal.phone",
    "personal.birthDate": "personal.birthDate",
    "personal.gender": "personal.gender",
    "personal.address": "personal.address",
    "academic.applicantType": "academic.applicantType",
    "academic.course": "academic.course",
    "academic.previousSchool": "academic.previousSchool",
  };

  for (const [path, fieldName] of Object.entries(encryptMap)) {
    if (target[path] !== undefined) {
      target[path] = encrypt(normalizeForStorage(fieldName, target[path]));
    }
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
  archivedPreregSchema.pre(hook, function () {
    rewriteLookupFilter(this.getFilter());
  });
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  archivedPreregSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

const ArchivedPreregistration =
  mongoose.models.ArchivedPreregistration ||
  mongoose.model("ArchivedPreregistration", archivedPreregSchema);

export default ArchivedPreregistration;