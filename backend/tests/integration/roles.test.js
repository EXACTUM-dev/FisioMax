/**
 * Pruebas de integración para endpoints principales del servidor
 * @fileoverview Tests que verifican el funcionamiento completo de los endpoints
 */

import request from 'supertest';
import app from '../../src/app';
import { updateRolUsuario } from '../../src/controllers/roles.controller'; 

describe('Roles API - Actualización de roles de usuario', () => {
  let mockUserId = '12345'; // ID de usuario de prueba
  let mockNewRole = 'Admin'; // Nuevo rol de prueba

  it('Debería actualizar el rol de un usuario correctamente', async () => {
    const response = await request(app)
      .patch(`/api/usuarios/${mockUserId}/rol`)
      .send({ rol: mockNewRole });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Rol actualizado correctamente');
  });

  it('Debería retornar un error si el usuario no existe', async () => {
    const response = await request(app)
      .patch(`/api/usuarios/invalidUserId/rol`)
      .send({ rol: mockNewRole });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuario no encontrado');
  });

  it('Debería retornar un error si el rol no es válido', async () => {
    const response = await request(app)
      .patch(`/api/usuarios/${mockUserId}/rol`)
      .send({ rol: 'InvalidRole' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Rol no válido');
  });
});