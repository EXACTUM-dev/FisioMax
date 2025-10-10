/**
 * @fileoverview Helpers para llamadas al backend. Incluye util para enviar
 * el token de Clerk (Bearer) obtenido desde el cliente Clerk.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { useAuth } from '@clerk/clerk-react';

/**
 * Realiza una petición fetch al backend con el token de Clerk en la cabecera Authorization.
 * @param {string} path - ruta relativa al backend (ej. /api/profile)
 * @param {RequestInit} options - opciones de fetch
 * @param {string} clerkToken - token JWT de Clerk (si ya se obtuvo)
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

/**
 * Convenience: use this client-side to get a token from Clerk and call the backend.
 * Example usage from a React component:
 * import { useAuth } from '@clerk/clerk-react';
 * const { getToken } = useAuth();
 * const token = await getToken();
 * await fetchWithClerk('/api/profile', { method: 'GET' }, token);
 */