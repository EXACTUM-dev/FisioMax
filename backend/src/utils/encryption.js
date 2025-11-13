import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

/**
 * Encrypts sensitive data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encryptedData
 */
export function encrypt(text) {
  if (!text || text === "") return "";

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts encrypted data
 * @param {string} encryptedText - Encrypted text in format: iv:authTag:encryptedData
 * @returns {string} Original text
 */
export function decrypt(encryptedText) {
  if (!encryptedText || encryptedText === "") return "";

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) return encryptedText; // Not encrypted

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting:", error);
    return encryptedText;
  }
}

/**
 * Encrypts multiple fields in an object
 * @param {Object} data - Object with fields to encrypt
 * @param {Array<string>} fields - Field names to encrypt
 * @returns {Object} Object with encrypted fields
 */
export function encryptFields(data, fields) {
  const result = { ...data };
  fields.forEach((field) => {
    if (result[field]) {
      result[field] = encrypt(result[field]);
    }
  });
  return result;
}

/**
 * Decrypts multiple fields in an object
 * @param {Object} data - Object with encrypted fields
 * @param {Array<string>} fields - Field names to decrypt
 * @returns {Object} Object with decrypted fields
 */
export function decryptFields(data, fields) {
  const result = { ...data };
  fields.forEach((field) => {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  });
  return result;
}
