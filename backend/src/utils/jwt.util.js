
/**
 * @fileoverview Utilitario mínimo para firmar y verificar JWTs locales (si los necesitamos)
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import jwt from 'jsonwebtoken';
import config from '../../../config.js';

export function sign(payload, options = {}) {
	const secret = config.auth?.jwtSecret;
	if (!secret) throw new Error('JWT secret no configurado');
	return jwt.sign(payload, secret, { expiresIn: '1h', ...options });
}

export function verify(token) {
	const secret = config.auth?.jwtSecret;
	if (!secret) throw new Error('JWT secret no configurado');
	return jwt.verify(token, secret);
}
