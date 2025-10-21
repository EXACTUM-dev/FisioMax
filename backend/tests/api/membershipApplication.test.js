/**
 * @fileoverview Pruebas para el API de solicitudes de membresía
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import request from 'supertest';
import express from 'express';
import membershipApplicationRoutes from '../src/routes/membershipApplication.routes.js';

const app = express();
app.use(express.json());
app.use('/api/membership-applications', membershipApplicationRoutes);

describe('Membership Application API', () => {
  describe('POST /api/membership-applications', () => {
    it('should create a new membership application', async () => {
      const applicationData = {
        nombres: 'Juan',
        apellidos: 'Pérez García',
        telefono: '555-123-4567',
        email: 'juan@ejemplo.com',
        pais: 'México',
        estado: 'Querétaro',
        ciudad: 'Querétaro',
        colonia: 'Centro',
        codigoPostal: '76000',
        licenciatura: 'Fisioterapia'
      };

      const response = await request(app)
        .post('/api/membership-applications')
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombres).toBe('Juan');
      expect(response.body.data.apellidos).toBe('Pérez García');
      expect(response.body.data.email).toBe('juan@ejemplo.com');
      expect(response.body.data.estado).toBe('pendiente');
    });

    it('should return validation error for missing required fields', async () => {
      const incompleteData = {
        nombres: 'Juan',
        // Incomplete personal information
      };

      const response = await request(app)
        .post('/api/membership-applications')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid email', async () => {
      const invalidData = {
        nombres: 'Juan',
        apellidos: 'Pérez García',
        email: 'email-invalido',
        pais: 'México',
        estado: 'Querétaro',
        ciudad: 'Querétaro'
      };

      const response = await request(app)
        .post('/api/membership-applications')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/membership-applications', () => {
    it('should get all membership applications', async () => {
      const response = await request(app)
        .get('/api/membership-applications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter applications by status', async () => {
      const response = await request(app)
        .get('/api/membership-applications?estado=pendiente');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/membership-applications/:id/status', () => {
    it('should update application status', async () => {
      // First, a new application is created
      const applicationData = {
        nombres: 'María',
        apellidos: 'González López',
        email: 'maria@ejemplo.com',
        pais: 'México',
        estado: 'Jalisco',
        ciudad: 'Guadalajara'
      };

      const createResponse = await request(app)
        .post('/api/membership-applications')
        .send(applicationData);

      const applicationId = createResponse.body.data.id;

      // Update status
      const updateData = {
        estado: 'aprobada',
        notas: 'Documentación verificada correctamente'
      };

      const response = await request(app)
        .put(`/api/membership-applications/${applicationId}/status`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('aprobada');
    });

    it('should return error for invalid status', async () => {
      const invalidData = {
        estado: 'estado_invalido'
      };

      const response = await request(app)
        .put('/api/membership-applications/test-id/status')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
