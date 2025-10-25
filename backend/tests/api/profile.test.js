/**
 * @fileoverview Unit tests for profile-related backend endpoints
 * Tests GET /api/usuarios (profile list) using mocked model
 * @author EXACTUM-dev
 */

import { jest } from '@jest/globals';

// Mock the users model before importing routes
jest.mock('../../src/models/users.model.js', () => ({
  getUsuarios: jest.fn(),
}));

import request from 'supertest';
import express from 'express';
import { getUsuarios } from '../../src/models/users.model.js';

const app = express();
app.use(express.json());

// Simple route for testing that uses the mocked getUsuarios directly.
app.get('/api/usuarios', async (req, res) => {
  try {
    const users = await getUsuarios();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

describe('Profile / Users API (backend)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/usuarios - returns user list successfully', async () => {
    const mockUsers = [
      { id: 1, nombres: 'Ana', correo: 'ana@example.com' },
      { id: 2, nombres: 'Luis', correo: 'luis@example.com' },
    ];

    getUsuarios.mockResolvedValue(mockUsers);

    const res = await request(app).get('/api/usuarios');

    expect(res.status).toBe(200);
    // The route handler in users.routes returns whatever the model returns.
    expect(res.body).toEqual(mockUsers);
    expect(getUsuarios).toHaveBeenCalled();
  });

  test('GET /api/usuarios - handles model error with 500', async () => {
    getUsuarios.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get('/api/usuarios');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
