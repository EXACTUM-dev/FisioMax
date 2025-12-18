
/**
 * @fileoverview Authentication service - combines Clerk and database data.
 * @version 2.0.0
 * @author EXACTUM-dev
 */
import { clerkClient } from '@clerk/clerk-sdk-node';
import config from '../../config.js';
import { getUserByClerkId, getUserByEmail, getMembershipUserStateById } from '../models/users.model.js';

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
    const clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress;

    // 2. Search user in DB by clerkID
    let dbUser = await getUserByClerkId(clerkUserId);
    let existsWithoutClerkId = false;

    // 3. If not found by clerkID, try searching by email
    // This handles the case where user submitted application but hasn't completed Clerk signup
    if (!dbUser && clerkEmail) {
      dbUser = await getUserByEmail(clerkEmail);
      if (dbUser) {
        existsWithoutClerkId = true; // User exists in DB but without clerkID
      }
    }

    // 4. Get membership state if user exists in DB
    let dbState = null;
    if (dbUser) {
      dbState = await getMembershipUserStateById(dbUser.IDUsuario);
    }

    // 5. Combine data
    return {
      clerkData: clerkUser,
      dbData: dbUser,
      exists: !!dbUser, // Flag to know if exists in DB
      existsWithoutClerkId, // Flag to know if user exists but without clerkID
      // Consolidated data for easy access
      id: dbUser?.IDUsuario || null,
      clerkID: clerkUserId,
      email: clerkEmail || dbUser?.correo || null,
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
