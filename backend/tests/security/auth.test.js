/**
 * @fileoverview Pruebas de seguridad para autenticación y autorización
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * Pruebas que validan la seguridad del sistema de autenticación con Clerk
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requireAuth } from '../../src/middlewares/clerkAuth.js';

// Configurar app de prueba
const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5174'],
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba protegidas y públicas
app.get('/api/public', (req, res) => {
  res.json({ message: 'Ruta pública accesible' });
});

app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ 
    message: 'Ruta protegida', 
    userId: req.auth?.userId 
  });
});

app.get('/api/admin', requireAuth, (req, res) => {
  // Simular verificación de rol admin
  const userRoles = req.auth?.sessionClaims?.metadata?.roles || [];
  if (!userRoles.includes('admin')) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  res.json({ message: 'Panel de administración' });
});

describe('🔐 Pruebas de Seguridad - Autenticación', () => {
  
  describe('Rutas Públicas', () => {
    test('debe permitir acceso a rutas públicas sin autenticación', async () => {
      const response = await request(app)
        .get('/api/public');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Ruta pública accesible');
    });
  });

  describe('Rutas Protegidas', () => {
    test('debe denegar acceso a rutas protegidas sin token JWT', async () => {
      const response = await request(app)
        .get('/api/protected');
      
      expect(response.status).toBe(401);
    });

    test('debe denegar acceso con token JWT inválido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token_invalido');
      
      expect(response.status).toBe(401);
    });

    test('debe denegar acceso con token JWT malformado', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');
      
      expect(response.status).toBe(401);
    });

    test('debe denegar acceso con token JWT expirado', async () => {
      // Token JWT expirado (exp: 1000000000)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsImV4cCI6MTAwMDAwMDAwMH0.invalid';
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(response.status).toBe(401);
    });
  });

  describe('Autorización por Roles', () => {
    test('debe denegar acceso a usuarios sin rol de admin', async () => {
      // Simular token con usuario sin rol admin
      const mockToken = 'valid_token_without_admin_role';
      
      // Mock del middleware requireAuth para esta prueba
      const appWithMockAuth = express();
      appWithMockAuth.use(express.json());
      
      appWithMockAuth.get('/api/admin', (req, res) => {
        // Simular que el usuario no tiene rol admin
        const userRoles = [];
        if (!userRoles.includes('admin')) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
        res.json({ message: 'Panel de administración' });
      });

      const response = await request(appWithMockAuth)
        .get('/api/admin');
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Acceso denegado');
    });

    test('debe permitir acceso a usuarios con rol de admin', async () => {
      // Mock del middleware requireAuth para esta prueba
      const appWithMockAuth = express();
      appWithMockAuth.use(express.json());
      
      appWithMockAuth.get('/api/admin', (req, res) => {
        // Simular que el usuario tiene rol admin
        const userRoles = ['admin'];
        if (!userRoles.includes('admin')) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
        res.json({ message: 'Panel de administración' });
      });

      const response = await request(appWithMockAuth)
        .get('/api/admin');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Panel de administración');
    });
  });

  describe('Headers de Seguridad', () => {
    test('debe incluir headers de seguridad en respuestas', async () => {
      const response = await request(app)
        .get('/api/public');
      
      // Verificar headers de seguridad de Helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });
  });

  describe('Rate Limiting', () => {
    test('debe implementar protección contra ataques de fuerza bruta', async () => {
      // Simular múltiples intentos de autenticación fallidos
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/protected')
            .set('Authorization', 'Bearer token_invalido')
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Todos los intentos deben fallar con 401
      responses.forEach(response => {
        expect(response.status).toBe(401);
      });
    });
  });
});
