import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  encrypt,
  decrypt,
  isEncrypted,
  hashLookup,
  normalizeForStorage,
} from "../utils/fieldCrypto.js";

const ENCRYPTED_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "idNumber",
  "email",
  "phone",
  "gender",
  "department",
  "notes",
];

const LOOKUP_FIELD_MAP = {
  email: "emailHash",
  idNumber: "idNumberHash",
  phone: "phoneHash",
  department: "departmentHash",
};

function encryptedField(fieldName, extra = {}) {
  return {
    type: String,
    ...extra,
    get: (value) => decrypt(value),
    set: (value) => {
      if (value === undefined || value === null || value === "") return value;
      return encrypt(normalizeForStorage(fieldName, value));
    },
  };
}

function getRaw(doc, field) {
  return doc.get(field, null, { getters: false });
}

function getPlain(doc, field) {
  return decrypt(getRaw(doc, field));
}

function ensureEncryptedDocFields(doc) {
  for (const field of ENCRYPTED_FIELDS) {
    const raw = getRaw(doc, field);

    if (raw === undefined || raw === null || raw === "") continue;

    if (!isEncrypted(raw)) {
      doc.set(field, raw);
    }
  }
}

function syncLookupHashes(doc) {
  doc.emailHash = hashLookup("email", getPlain(doc, "email"));
  doc.idNumberHash = hashLookup("idNumber", getPlain(doc, "idNumber"));
  doc.phoneHash = hashLookup("phone", getPlain(doc, "phone"));
  doc.departmentHash = hashLookup("department", getPlain(doc, "department"));
}

function isOperatorObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => key.startsWith("$"))
  );
}

function rewriteLookupFilter(filter) {
  if (!filter || typeof filter !== "object") return;

  for (const logical of ["$or", "$and", "$nor"]) {
    if (Array.isArray(filter[logical])) {
      filter[logical].forEach(rewriteLookupFilter);
    }
  }

  for (const [plainField, hashField] of Object.entries(LOOKUP_FIELD_MAP)) {
    if (!(plainField in filter)) continue;

    const value = filter[plainField];

    if (value === undefined) {
      delete filter[plainField];
      continue;
    }

    if (!isOperatorObject(value)) {
      filter[hashField] = hashLookup(plainField, value);
      delete filter[plainField];
      continue;
    }

    if (Array.isArray(value.$in)) {
      filter[hashField] = {
        $in: value.$in.map((item) => hashLookup(plainField, item)),
      };
      delete filter[plainField];
    }
  }
}

function applyEncryptedUpdate(update) {
  if (!update || typeof update !== "object") return;

  const target = update.$set || update;

  for (const field of ENCRYPTED_FIELDS) {
    if (target[field] !== undefined) {
      target[field] = encrypt(normalizeForStorage(field, target[field]));
    }
  }

  if (target.email !== undefined) {
    target.emailHash = hashLookup("email", decrypt(target.email));
  }

  if (target.idNumber !== undefined) {
    target.idNumberHash = hashLookup("idNumber", decrypt(target.idNumber));
  }

  if (target.phone !== undefined) {
    target.phoneHash = hashLookup("phone", decrypt(target.phone));
  }

  if (target.department !== undefined) {
    target.departmentHash = hashLookup("department", decrypt(target.department));
  }

  if (update.$set) {
    update.$set = target;
  }
}

const UserSchema = new mongoose.Schema(
  {
    firstName: encryptedField("firstName", { required: true }),
    middleName: encryptedField("middleName"),
    lastName: encryptedField("lastName", { required: true }),

    idNumber: encryptedField("idNumber", { required: true }),
    idNumberHash: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      select: false,
    },

    email: encryptedField("email", { required: true }),
    emailHash: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
      select: false,
    },

    phone: encryptedField("phone", { required: true }),
    phoneHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },

    gender: encryptedField("gender", { required: true }),

    role: {
      type: String,
      required: true,
      enum: [
        "Registrar",
        "Dept Head",
        "Finance",
        "Super Admin",
        "Faculty",
        "Student",
      ],
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeenAt: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    isTemporaryPassword: {
      type: Boolean,
      default: true,
    },

    department: encryptedField("department", { required: true }),
    departmentHash: {
      type: String,
      index: true,
      sparse: true,
      select: false,
    },

    notes: encryptedField("notes"),

    createdBy: {
      type: String,
      enum: ["SuperAdmin", "Registrar"],
      default: "SuperAdmin",
    },

    password: { type: String, required: true },

    credentialsSent: {
      type: Boolean,
      default: false,
    },

    resetCode: {
      type: String,
    },

    resetCodeExpires: {
      type: Date,
    },

    resetAttempts: {
      type: Number,
      default: 0,
    },

    resetLockUntil: {
      type: Date,
    },

    resetVerified: {
      type: Boolean,
      default: false,
    },
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

UserSchema.index(
  { role: 1, departmentHash: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "Dept Head" },
  },
);

UserSchema.pre("save", async function () {
  ensureEncryptedDocFields(this);
  syncLookupHashes(this);

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

for (const hook of [
  "find",
  "findOne",
  "countDocuments",
  "findOneAndUpdate",
  "updateOne",
  "updateMany",
]) {
  UserSchema.pre(hook, function () {
    rewriteLookupFilter(this.getFilter());
  });
}

for (const hook of ["findOneAndUpdate", "updateOne", "updateMany"]) {
  UserSchema.pre(hook, function () {
    applyEncryptedUpdate(this.getUpdate());
  });
}

export default mongoose.models.User || mongoose.model("User", UserSchema);