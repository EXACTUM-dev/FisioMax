
/**
 * @fileoverview Authentication service - combines Clerk and database data.
 * @version 2.0.0
 * @author EXACTUM-dev
 */
import { clerkClient } from '@clerk/clerk-sdk-node';
import config from '../../config.js';
import { getUserByClerkId, getMembershipUserStateById, getUserByEmail, updateUserClerkId } from '../models/users.model.js';

/**
 * Gets complete user information combining Clerk and DB data.
 *
 * @async
 * @param {string} clerkUserId - Clerk user ID.
 * @return {Promise<Object>} Combined user data (Clerk + DB).
 * @return {Object} return.clerkData - User data from Clerk.
 * @return {Object|null} return.dbData - User data from database.
 * @return {boolean} return.exists - Flag indicating if user exists in DB.
 * @return {number|null} return.id - User ID from database.
 * @return {string} return.clerkID - Clerk user ID.
 * @return {string|null} return.email - User email.
 * @return {string|null} return.firstName - User first name.
 * @return {string|null} return.lastName - User last name.
 * @return {string|null} return.imageUrl - User profile image URL.
 * @return {string|null} return.role - User role name.
 * @return {number|null} return.roleId - User role ID.
 * @throws {Error} When there's an error fetching user data.
 */
export async function getUserById(clerkUserId) {
  if (!clerkUserId) return null;

  try {
    // 1. Get data from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    // 2. Search user in DB by clerkID
    let dbUser = await getUserByClerkId(clerkUserId);

    // 3. If not found by clerkID, attempt to link by email (clerkID may be NULL in DB)
    if (!dbUser) {
      const email =
        clerkUser.emailAddresses?.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

      if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[getUserById] clerkID "${clerkUserId}" not found in DB, retrying by email "${normalizedEmail}"...`);

        const dbUserByEmail = await getUserByEmail(normalizedEmail);

        if (dbUserByEmail) {
          // Link the clerkID automatically and re-fetch fresh data
          console.log(`[getUserById] Linking clerkID "${clerkUserId}" to user ${dbUserByEmail.IDUsuario} (${normalizedEmail})`);
          await updateUserClerkId(dbUserByEmail.IDUsuario, clerkUserId);
          dbUser = await getUserByClerkId(clerkUserId);
        }
      }
    }

    // 4. Get membership state (only if user was found)
    const dbState = dbUser ? await getMembershipUserStateById(dbUser.IDUsuario) : null;

    // 5. Combine data
    return {
      clerkData: clerkUser,
      dbData: dbUser,
      exists: !!dbUser,
      id: dbUser?.IDUsuario || null,
      clerkID: clerkUserId,
      email:
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        dbUser?.correo ||
        null,
      firstName: clerkUser.firstName || dbUser?.nombres || null,
      lastName: clerkUser.lastName || dbUser?.apellidoP || null,
      imageUrl: clerkUser.imageUrl || dbUser?.foto || null,
      role: dbUser?.rolNombre || null,
      roleId: dbUser?.IDRol || null,
      membershipState: dbState,
      // Membership details
      membershipType: dbUser?.membresiaTipo || null,
      membershipExpiresAt: dbUser?.membresiaFechaVencimiento || null,
      membershipRegisteredAt: dbUser?.membresiaCreatedAt || null,
      membershipPaymentStatus: dbUser?.membresiaEstatusPago || null,
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Verifies if a Clerk user exists in the database.
 *
 * @async
 * @param {string} clerkUserId - Clerk user ID.
 * @return {Promise<boolean>} True if user exists in DB, false otherwise.
 */
export async function userExistsInDB(clerkUserId) {
  if (!clerkUserId) return false;

  try {
    const dbUser = await getUserByClerkId(clerkUserId);
    return !!dbUser;
  } catch (err) {
    return false;
  }
}

/**
 * Tries to sync a Clerk user with a DB user by email.
 * Used when a user exists in Clerk but not in DB with that Clerk ID.
 *
 * @async
 * @param {string} clerkUserId - Clerk user ID.
 * @return {Promise<boolean>} True if synced successfully, false otherwise.
 */
export async function syncUserWithClerk(clerkUserId) {
  if (!clerkUserId) return false;

  try {
    // 1. Get email from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) return false;

    // 2. Search user in DB by email
    const dbUser = await getUserByEmail(email);

    if (dbUser) {
      // 3. User found by email! Update their Clerk ID to the new one.
      // We check if the user already has a DIFFERENT clerkID to avoid overwriting if not intended,
      // but in this migration case, we arguably WANT to overwrite the old Clerk ID.
      console.log(`Syncing user ${dbUser.IDUsuario} (Email: ${email}) with new Clerk ID: ${clerkUserId}`);
      const updated = await updateUserClerkId(dbUser.IDUsuario, clerkUserId);
      return updated;
    }

    return false;
  } catch (err) {
    console.error('Error syncing user with Clerk:', err);
    return false;
  }
}
