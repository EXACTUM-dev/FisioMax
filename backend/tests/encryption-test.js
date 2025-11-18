/**
 * @fileoverview Test script to verify encryption/decryption functionality
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
} from "../src/services/encryptionService.js";

console.log("🔐 Testing Encryption Service\n");

// Test 1: Basic encryption/decryption
console.log("Test 1: Basic encryption/decryption");
const testEmail = "test@example.com";
const encryptedEmail = encrypt(testEmail);
const decryptedEmail = decrypt(encryptedEmail);

console.log("Original:", testEmail);
console.log("Encrypted:", encryptedEmail);
console.log("Decrypted:", decryptedEmail);
console.log("Match:", testEmail === decryptedEmail ? "✅" : "❌");
console.log("");

// Test 2: Email normalization consistency
console.log("Test 2: Email normalization consistency");
const email1 = "Test@Example.com";
const email2 = "test@example.com";
const normalized1 = email1.toLowerCase().trim();
const normalized2 = email2.toLowerCase().trim();

const encrypted1 = encrypt(normalized1);
const encrypted2 = encrypt(normalized2);

console.log("Email 1 (normalized):", normalized1);
console.log("Email 2 (normalized):", normalized2);
console.log("Encrypted 1:", encrypted1);
console.log("Encrypted 2:", encrypted2);
console.log(
  "Same encryption:",
  encrypted1 === encrypted2 ? "❌ (should be different due to random IV)" : "✅"
);
console.log(
  "Both decrypt to same value:",
  decrypt(encrypted1) === decrypt(encrypted2) ? "✅" : "❌"
);
console.log("");

// Test 3: encryptFields/decryptFields
console.log("Test 3: encryptFields/decryptFields");
const userData = {
  nombres: "Juan",
  apellidoP: "Pérez",
  correo: "juan@example.com",
  telefono: "1234567890",
};

const sensitiveFields = ["nombres", "apellidoP", "correo"];
const encryptedData = encryptFields(userData, sensitiveFields);
const decryptedData = decryptFields(encryptedData, sensitiveFields);

console.log("Original data:", userData);
console.log("Encrypted data:", encryptedData);
console.log("Decrypted data:", decryptedData);
console.log(
  "Match nombres:",
  userData.nombres === decryptedData.nombres ? "✅" : "❌"
);
console.log(
  "Match apellidoP:",
  userData.apellidoP === decryptedData.apellidoP ? "✅" : "❌"
);
console.log(
  "Match correo:",
  userData.correo === decryptedData.correo ? "✅" : "❌"
);
console.log(
  "telefono unchanged:",
  userData.telefono === encryptedData.telefono ? "✅" : "❌"
);
console.log("");

// Test 4: Empty and null values
console.log("Test 4: Empty and null values");
const emptyData = {
  nombres: "",
  apellidoP: null,
  correo: undefined,
  telefono: "1234567890",
};

const encryptedEmpty = encryptFields(emptyData, sensitiveFields);
console.log("Empty data:", emptyData);
console.log("Encrypted empty:", encryptedEmpty);
console.log(
  "Empty string unchanged:",
  encryptedEmpty.nombres === "" ? "✅" : "❌"
);
console.log("Null unchanged:", encryptedEmpty.apellidoP === null ? "✅" : "❌");
console.log(
  "Undefined unchanged:",
  encryptedEmpty.correo === undefined ? "✅" : "❌"
);
console.log("");

console.log("✅ All encryption tests completed!");
