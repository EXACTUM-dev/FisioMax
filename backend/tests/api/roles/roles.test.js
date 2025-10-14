/**
 * @fileoverview Pruebas para el API de Roles (Roles Controller)
 * @version 0.3.0
 * @author EXACTUM-dev
 */

// Mocks de Jest - DEBEN estar al inicio del archivo
jest.mock('../../src/models/roles.model.js');
jest.mock('../../src/models/privileges.model.js');

import request from 'supertest';
import express from 'express';

// Importar las funciones del controlador
import { getRoleById, updateRole, getAllRoles } from '../../src/controllers/roles.controller.js';

// Mockear las funciones de los modelos
import * as rolesModel from '../../src/models/roles.model.js';
import * as privilegesModel from '../../src/models/privileges.model.js';

// Configuración de la aplicación Express para las pruebas
const app = express();
app.use(express.json());

// Definición de rutas para el controlador
app.get('/api/roles/:id', getRoleById);
app.put('/api/roles/:id', updateRole);
app.get('/api/roles', getAllRoles);

// Datos de mock
const MOCK_ROLE_ID = 1;
const MOCK_ROLE = { IDRol: MOCK_ROLE_ID, nombre: 'Admin', descripcion: 'Administrador del sistema' };
const MOCK_ALL_PRIVILEGES = [
  { id: 1, name: 'view_dashboard' },
  { id: 2, name: 'edit_users' },
  { id: 3, name: 'manage_roles' },
];
const MOCK_ROLE_PRIVILEGES = [
  { id: 1, name: 'view_dashboard' },
  { id: 3, name: 'manage_roles' },
];

describe('Roles API', () => {
  // Limpiar todos los mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Limpiar todos los mocks después de todos los tests
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/roles/:id', () => {
    it('should return role data with mapped privileges successfully', async () => {
      // Configurar Mocks
      rolesModel.findRoleById.mockResolvedValue(MOCK_ROLE);
      privilegesModel.getRolePrivileges.mockResolvedValue(MOCK_ROLE_PRIVILEGES);
      privilegesModel.getAllPrivileges.mockResolvedValue(MOCK_ALL_PRIVILEGES);

      const response = await request(app)
        .get(`/api/roles/${MOCK_ROLE_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(MOCK_ROLE_ID);
      expect(response.body.data.name).toBe('Admin');
      expect(Array.isArray(response.body.data.privileges)).toBe(true);

      // Verificar que los privilegios están correctamente mapeados (checked: true/false)
      const viewDashboard = response.body.data.privileges.find(p => p.id === 1);
      expect(viewDashboard.checked).toBe(true);

      const editUsers = response.body.data.privileges.find(p => p.id === 2);
      expect(editUsers.checked).toBe(false);
    });

    // ... resto de tus tests
  });

  // ... resto de tus describe blocks
});