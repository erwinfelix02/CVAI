import crypto from "crypto";

const ENC_PREFIX = "enc::v1::";

const DATA_SECRET =
  process.env.DATA_SECRET || "change-this-in-production-now";
const LOOKUP_SECRET =
  process.env.DATA_LOOKUP_SECRET || process.env.DATA_SECRET || DATA_SECRET;

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(String(DATA_SECRET))
  .digest();

function toSafeString(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

export function isEncrypted(value) {
  return typeof value === "string" && value.startsWith(ENC_PREFIX);
}

export function normalizeForStorage(field, value) {
  const str = toSafeString(value).trim();

  switch (field) {
    case "email":
      return str.toLowerCase();
    case "phone":
      return str.replace(/\s+/g, "");
    default:
      return str;
  }
}

export function normalizeForLookup(field, value) {
  const str = toSafeString(value).trim();

  switch (field) {
    case "email":
      return str.toLowerCase();

    case "idNumber":
      return str.toUpperCase();

    case "phone":
      return str.replace(/\s+/g, "");

    case "department":
      return str.toLowerCase();

    default:
      return str;
  }
}

export function encrypt(value) {
  if (value === undefined || value === null || value === "") return value;

  const plainText = String(value);
  if (isEncrypted(plainText)) return plainText;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${ENC_PREFIX}${iv.toString("base64")}:${authTag.toString(
    "base64",
  )}:${encrypted.toString("base64")}`;
}

export function decrypt(value) {
  if (value === undefined || value === null || value === "") return value;

  const cipherText = String(value);
  if (!isEncrypted(cipherText)) return cipherText;

  try {
    const payload = cipherText.slice(ENC_PREFIX.length);
    const [ivB64, tagB64, encryptedB64] = payload.split(":");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      ENCRYPTION_KEY,
      Buffer.from(ivB64, "base64"),
    );

    decipher.setAuthTag(Buffer.from(tagB64, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedB64, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    return cipherText;
  }
}

/**
 * Blind index / lookup hash for exact queries and unique checks.
 * This is NOT for display. This is only for searching.
 */
export function hashLookup(field, value) {
  const normalized = normalizeForLookup(field, value);
  if (!normalized) return undefined;

  return crypto
    .createHmac("sha256", String(LOOKUP_SECRET))
    .update(`${field}:${normalized}`)
    .digest("hex");
}