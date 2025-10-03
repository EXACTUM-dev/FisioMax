/**
 * Pruebas de integración para autenticación y autorización
 * @fileoverview Tests que verifican el flujo completo de autenticación
 */

import request from 'supertest';
import { app } from '../../server.js';

describe('Pruebas de Integración - Autenticación', () => {
  
  describe('Endpoints protegidos sin autenticación', () => {
    test('GET /api/usuarios sin token debería fallar', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/admin sin token debería fallar', async () => {
      const response = await request(app)
        .get('/api/admin')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Endpoints protegidos con token inválido', () => {
    test('GET /api/usuarios con token inválido debería fallar', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Endpoints protegidos con token válido', () => {
    // Mock de un token válido para pruebas
    const mockValidToken = 'mock-valid-token';
    
    beforeEach(() => {
      // Mock del middleware de autenticación para pruebas
      jest.doMock('../../src/middlewares/clerkAuth.js', () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: 'test-user-123',
            sessionClaims: {
              metadata: {
                roles: ['user']
              }
            }
          };
          next();
        }
      }));
    });

    test('GET /api/usuarios con token válido debería funcionar', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${mockValidToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('authenticatedUserId', 'test-user-123');
    });
  });

  describe('Autorización por roles', () => {
    beforeEach(() => {
      // Mock del middleware con rol de admin
      jest.doMock('../../src/middlewares/clerkAuth.js', () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: 'admin-user-123',
            sessionClaims: {
              metadata: {
                roles: ['admin']
              }
            }
          };
          next();
        }
      }));
    });

    test('GET /api/admin con rol admin debería funcionar', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Panel de administración');
    });
  });

  describe('Autorización sin rol admin', () => {
    beforeEach(() => {
      // Mock del middleware sin rol de admin
      jest.doMock('../../src/middlewares/clerkAuth.js', () => ({
        requireAuth: (req, res, next) => {
          req.auth = {
            userId: 'regular-user-123',
            sessionClaims: {
              metadata: {
                roles: ['user']
              }
            }
          };
          next();
        }
      }));
    });

    test('GET /api/admin sin rol admin debería fallar', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Acceso denegado');
    });
  });
});
