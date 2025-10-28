/**
 * @fileoverview Minimum configuration for Clerk on the frontend.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default {
	publishableKey: PUBLISHABLE_KEY
};
