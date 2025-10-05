
/**
 * @fileoverview Middleware de autenticación genérico. El proyecto ya usa
 * `src/middlewares/clerkAuth.js` (ClerkExpressRequireAuth). Este archivo
 * provee una alternativa para validar tokens Bearer (JWT propios) si se necesita.
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { verify } from '../utils/jwt.util.js';

export async function jwtAuth(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const match = authHeader.match(/^Bearer\s+(.+)$/i);
	if (!match) return res.status(401).json({ error: 'Token no proporcionado' });
	const token = match[1];
	try {
		const payload = verify(token);
		req.user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Token inválido', detail: err?.message });
	}
}
