/**
 * Pruebas de integración para manejo de errores
 * @fileoverview Tests que verifican el manejo completo de diferentes tipos de errores
 */

import request from 'supertest';
import { app } from '../../server.js';

describe('Pruebas de Integración - Manejo de Errores', () => {
  
  describe('Errores de validación', () => {
    test('debería manejar errores de validación correctamente', async () => {
      const response = await request(app)
        .get('/api/error/validation')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores de autorización', () => {
    test('debería manejar errores de autorización correctamente', async () => {
      const response = await request(app)
        .get('/api/error/unauthorized')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No autorizado');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores de permisos', () => {
    test('debería manejar errores de permisos correctamente', async () => {
      const response = await request(app)
        .get('/api/error/forbidden')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Acceso denegado');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores internos del servidor', () => {
    test('debería manejar errores internos correctamente', async () => {
      const response = await request(app)
        .get('/api/error/internal')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Error interno del servidor');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores de timeout', () => {
    test('debería manejar errores de timeout correctamente', async () => {
      const response = await request(app)
        .get('/api/error/timeout')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Error interno del servidor');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores asíncronos', () => {
    test('debería manejar errores asíncronos correctamente', async () => {
      const response = await request(app)
        .get('/api/error/async')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Error interno del servidor');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Errores de parsing de JSON', () => {
    test('debería manejar JSON malformado en body', async () => {
      const response = await request(app)
        .post('/api/error/body-parser')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Rutas no encontradas', () => {
    test('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/ruta-inexistente')
        .expect(404);

      // Express por defecto devuelve 404 para rutas no encontradas
      expect(response.status).toBe(404);
    });
  });

  describe('Métodos HTTP no permitidos', () => {
    test('debería manejar métodos HTTP no permitidos', async () => {
      const response = await request(app)
        .delete('/api/test')
        .expect(404);

      // El endpoint no soporta DELETE
      expect(response.status).toBe(404);
    });
  });

  describe('Headers de seguridad', () => {
    test('debería incluir headers de seguridad en respuestas de error', async () => {
      const response = await request(app)
        .get('/api/error/internal')
        .expect(500);

      // Verificar que los headers de seguridad están presentes
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
