
/**
 * @fileoverview Servicio de autenticación - wrapper mínimo sobre Clerk SDK
 * @version 1.0.0
 * @author EXACTUM-dev
 */
// Use the server-side Clerk client provided by the SDK. Depending on the
// SDK version the package exposes a named `clerkClient` export that is
// already configured to call Clerk's server APIs. Avoid trying to
// instantiate a default export as a constructor (that's what caused the
// "Clerk is not a constructor" error).
import { clerkClient } from '@clerk/clerk-sdk-node';
import config from '../../config.js';

// Note: some Clerk SDK versions pick up configuration from
// process.env.CLERK_SECRET_KEY or similar. If you rely on `config` we
// could also set process.env here as a fallback. Keep simple for now and
// use the provided `clerkClient`.

/**
 * Obtiene información del usuario por ID usando Clerk
 * @param {string} userId
 * @returns {Promise<Object>} usuario
 */
export async function getUserById(userId) {
	if (!userId) return null;
	try {
		// clerkClient.users.getUser puede variar según la versión; usar la API REST si es necesario
		const user = await clerkClient.users.getUser(userId);
		return user;
	} catch (err) {
		console.error('auth.service.getUserById error:', err?.message || err);
		throw err;
	}
}
