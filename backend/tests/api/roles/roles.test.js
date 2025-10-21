/**
 * @fileoverview Api roles tests(Roles Controller)
 * @author EXACTUM-dev
 * @version 1.0.0
 */

// Jest mocks must be at the top level
jest.mock('../../src/models/roles.model.js');
jest.mock('../../src/models/privileges.model.js');

// Third party dependencies
import request from 'supertest';
import express from 'express';

// Import controllers functions to test
import { getRoleById, updateRole, getAllRoles } from '../../src/controllers/roles.controller.js';

// Aplication dependencies
import * as rolesModel from '../../src/models/roles.model.js';
import * as privilegesModel from '../../src/models/privileges.model.js';

// Configure Express app for testing
const app = express();
app.use(express.json());

// Define routes for the controller
app.get('/api/roles/:id', getRoleById);
app.put('/api/roles/:id', updateRole);
app.get('/api/roles', getAllRoles);

// Mock data for the tests
const mockRoleId = 1;
const mockRole = { IDRol: mockRoleId, nombre: 'Admin', descripcion: 'Administrador del sistema' };
const mockAllPrivileges = [
  { id: 1, name: 'view_dashboard' },
  { id: 2, name: 'edit_users' },
  { id: 3, name: 'manage_roles' },
];
const mockRolePrivileges = [
  { id: 1, name: 'view_dashboard' },
  { id: 3, name: 'manage_roles' },
];

// Tests
describe('Roles API', () => {
  //Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Clean up all mocks after all tests
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/roles/:id', () => {
    it('should return role data with mapped privileges successfully', async () => {
      // Mock model functions
      rolesModel.findRoleById.mockResolvedValue(mockRole);
      privilegesModel.getRolePrivileges.mockResolvedValue(mockRolePrivileges);
      privilegesModel.getAllPrivileges.mockResolvedValue(mockAllPrivileges);

      const response = await request(app)
        .get(`/api/roles/${mockRoleId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockRoleId);
      expect(response.body.data.name).toBe('Admin');
      expect(Array.isArray(response.body.data.privileges)).toBe(true);

      // Verify user privileges (checked: true/false)
      const viewDashboard = response.body.data.privileges.find(p => p.id === 1);
      expect(viewDashboard.checked).toBe(true);

      const editUsers = response.body.data.privileges.find(p => p.id === 2);
      expect(editUsers.checked).toBe(false);
    });

  });
});