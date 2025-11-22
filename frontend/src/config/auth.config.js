/**
 * @fileoverview Minimum configuration for Clerk on the frontend.
 * @version 1.1.0
 * @author EXACTUM-dev
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default {
	publishableKey: PUBLISHABLE_KEY,
	// Session configuration
	sessionTokenRefreshInSeconds: 60, // Refresh token every minute to validate activity
	sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
};
