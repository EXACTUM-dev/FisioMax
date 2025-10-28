
/**
 * @fileoverview Authentication service - combines Clerk and database data.
 * @version 2.0.0
 * @author EXACTUM-dev
 */
import {clerkClient} from '@clerk/clerk-sdk-node';
import config from '../../config.js';
import {getUserByClerkId} from '../models/users.model.js';

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
    const dbUser = await getUserByClerkId(clerkUserId);

    // 3. Combine data
    return {
      clerkData: clerkUser,
      dbData: dbUser,
      exists: !!dbUser, // Flag to know if exists in DB
      // Consolidated data for easy access
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
    };
  } catch (err) {
    console.error('auth.service.getUserById error:', err?.message || err);
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
    console.error('auth.service.userExistsInDB error:', err?.message || err);
    return false;
  }
}
