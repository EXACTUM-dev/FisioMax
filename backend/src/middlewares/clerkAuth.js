/**
 * @fileoverview Middleware de autentificación de Clerk con Express.js.
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * Verifica el JWT de Clerk y adjunta la información del usuario a la solicitud.
 */
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY
});

// Usar en tus rutas:
app.get('/api/usuarios', requireAuth, (req, res) => {
  // req.auth contiene la información del usuario
  const userId = req.auth.userId;
});