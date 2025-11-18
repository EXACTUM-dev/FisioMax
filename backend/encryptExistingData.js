// scripts/encryptExistingData.js
import db from "../database/db.js";
import { encrypt } from "../src/services/encryptionService.js";
import dotenv from "dotenv";

dotenv.config();

const SENSITIVE_FIELDS = [
  "nombres",
  "apellidoP",
  "apellidoM",
  "correo",
  "telefonoProfesional",
  "telefonoWhatsapp",
  "colonia",
  "calle",  
  "codigoPostal",
];

/**
 * Encrypts sensitive data for a single user.
 * @param {number} userId - The ID of the user to encrypt
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function encryptUserData(userId) {
  const conn = await db.getConnection();

  try {
    console.log(`\n🔐 Encrypting data for user ID: ${userId}`);

    // Get current user data
    const [rows] = await conn.execute(
      "SELECT * FROM usuario WHERE IDUsuario = ?",
      [userId]
    );

    if (rows.length === 0) {
      console.log("❌ User not found");
      return false;
    }

    const user = rows[0];
    console.log("📄 Current data:", {
      nombres: user.nombres,
      correo: user.correo,
    });

    // Encrypt each sensitive field
    const updates = {};
    for (const field of SENSITIVE_FIELDS) {
      if (user[field] && user[field].trim() !== "") {
        // Check if already encrypted (contains colons)
        if (user[field].includes(":")) {
          console.log(`⏭️  Skipping ${field} - already encrypted`);
          continue;
        }

        const encrypted = encrypt(user[field]);
        updates[field] = encrypted;
        console.log(`✅ Encrypted ${field}`);
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log("ℹ️  No fields to encrypt or all already encrypted");
      return true;
    }

    // Build update query
    const setClause = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const query = `UPDATE usuario SET ${setClause} WHERE IDUsuario = ?`;

    await conn.execute(query, [...values, userId]);

    console.log(
      `✨ Successfully encrypted ${
        Object.keys(updates).length
      } fields for user ${userId}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error encrypting data for user ${userId}:`, error);
    return false;
  } finally {
    conn.release();
  }
}

/**
 * Encrypts all users in the database.
 * @returns {Promise<void>}
 */
async function encryptAllUsers() {
  const conn = await db.getConnection();
  try {
    console.log("\n📊 Fetching all users from database...");

    // Get all users that are not deleted
    const [users] = await conn.execute(
      "SELECT IDUsuario FROM usuario WHERE eliminado = 0 ORDER BY IDUsuario"
    );

    console.log(`📋 Found ${users.length} users to process\n`);

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    // Process each user
    for (let i = 0; i < users.length; i++) {
      const userId = users[i].IDUsuario;
      console.log(`\n[${i + 1}/${users.length}] Processing user ID: ${userId}`);

      const result = await encryptUserData(userId);

      if (result) {
        successCount++;
      } else {
        failureCount++;
      }

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 Migration Summary:");
    console.log(`✅ Successfully processed: ${successCount} users`);
    console.log(`❌ Failed: ${failureCount} users`);
    console.log(`📊 Total: ${users.length} users`);
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Main function to run the migration.
 */
async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Starting data encryption migration...");
  console.log("⚠️  Make sure ENCRYPTION_KEY is set in .env");
  console.log("=".repeat(50));

  if (!process.env.ENCRYPTION_KEY) {
    console.error("\n❌ ENCRYPTION_KEY not found in environment variables");
    console.error("Please add ENCRYPTION_KEY to your .env file");
    process.exit(1);
  }

  console.log("✅ ENCRYPTION_KEY found");
  console.log(
    `🔑 Key length: ${process.env.ENCRYPTION_KEY.length} characters\n`
  );

  try {
    // Encrypt all users
    await encryptAllUsers();

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
