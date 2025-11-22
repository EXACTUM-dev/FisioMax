/**
 * @fileoverview Helper utilities for backend API calls with Clerk authentication.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { useAuth } from '@clerk/clerk-react';

/**
 * Makes a fetch request to the backend with Clerk token in Authorization header.
 * Automatically includes the Clerk JWT token as a Bearer token if provided.
 * Throws an error if the request fails.
 * @param {string} path Relative path to the backend endpoint (e.g., /api/profile).
 * @param {RequestInit} [options={}] Fetch options (method, headers, body, etc.).
 * @param {string} clerkToken Clerk JWT token (if already obtained).
 * @returns {Promise<Object>} Parsed JSON response from the server.
 * @throws {Error} If the request fails with status and response body attached.
 */
export async function fetchWithClerk(path, options = {}, clerkToken) {
	const headers = new Headers(options.headers || {});
	if (clerkToken) {
		headers.set('Authorization', `Bearer ${clerkToken}`);
	}
	const res = await fetch(path, { ...options, headers });
	if (!res.ok) {
		const text = await res.text();
		const err = new Error(`Request failed ${res.status} ${res.statusText}`);
		err.status = res.status;
		err.body = text;
		throw err;
	}
	return res.json();
}