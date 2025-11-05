/**
 * @fileoverview Test - Managment of membership applications
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * User story: HU-08 - Revisar y aprobar solicitudes de membrecía
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import membershipManagementRoutes from '../../src/routes/membershipApplication.routes.js';

// SES service Mock
jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' })
  })),
  SendEmailCommand: jest.fn()
}));

// S3 service Mock
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/membresias', membershipManagementRoutes);

describe('Gestión de Solicitudes de Membresía - API', () => {
  
  /** ==========================================
   *   VIEWING MEMBERSHIP APPLICATIONS
   *  ==========================================
   */
  describe('GET /api/membresias - Listar solicitudes', () => {
    it('should get all membership applications with their status', async () => {
      const response = await request(app)
        .get('/api/membresias');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Validate that every application has the necessary fields
      if (response.body.data.length > 0) {
        const solicitud = response.body.data[0];
        expect(solicitud).toHaveProperty('IDMembresia');
        expect(solicitud).toHaveProperty('nombres');
        expect(solicitud).toHaveProperty('apellidoP');
        expect(solicitud).toHaveProperty('correo');
        expect(solicitud).toHaveProperty('tipo');
        expect(solicitud).toHaveProperty('aceptado');
        expect(solicitud).toHaveProperty('estatusPago');
      }
    });

    it('should filter applications by payment status', async () => {
      // State by  Adaptado del filtro por estado
      const response = await request(app)
        .get('/api/membresias?estatusPago=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verificar que todas las solicitudes retornadas tengan pago realizado
      response.body.data.forEach(solicitud => {
        expect(solicitud.estatusPago).toBe(true);
      });
    });

    it('should filter applications by acceptance status', async () => {
      // Pendientes
      const responsePendientes = await request(app)
        .get('/api/membresias?aceptado=null');
      
      expect(responsePendientes.status).toBe(200);
      
      // Aceptadas
      const responseAceptadas = await request(app)
        .get('/api/membresias?aceptado=1');
      
      expect(responseAceptadas.status).toBe(200);
      
      // Rechazadas
      const responseRechazadas = await request(app)
        .get('/api/membresias?aceptado=0');
      
      expect(responseRechazadas.status).toBe(200);
    });
  });

  // ==========================================
  // VISUALIZACIÓN DE DOCUMENTOS
  // Nuevo - específico para esta historia
  // ==========================================
  
  describe('GET /api/membresias/:id/documento/:tipo - Ver documento', () => {
    it('should return document URL for valid request', async () => {
      const response = await request(app)
        .get('/api/membresias/1/documento/titulo');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data.url).toContain('s3');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/membresias/999/documento/titulo');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should support different document types', async () => {
      const documentTypes = ['titulo', 'constancia', 'cedula', 'adicional'];
      
      for (const tipo of documentTypes) {
        const response = await request(app)
          .get(`/api/membresias/1/documento/${tipo}`);
        
        // It will return 200 if it exist or 404 if it doesn't
        expect([200, 404]).toContain(response.status);
      }
    });
  });

  /** ==========================================
   *   UPLOAD OF PAYMENT VOUCHER
   *  ==========================================
   */
  describe('POST /api/membresias/:id/comprobante - Subir comprobante', () => {
    it('should upload PDF payment proof successfully', async () => {
      const response = await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('fake-pdf-content'), 'comprobante.pdf')
        .set('Content-Type', 'multipart/form-data');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('filename');
      
      // Validate that the name includes timestamp
      expect(response.body.data.filename).toMatch(/^\d{13}\.pdf$/);
    });

    it('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('fake-image'), 'comprobante.jpg')
        .set('Content-Type', 'multipart/form-data');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('PDF');
    });

    it('should return error for missing file', async () => {
      const response = await request(app)
        .post('/api/membresias/1/comprobante')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requerido');
    });

    it('should update payment status after upload', async () => {
      // Upload proof of payment
      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('fake-pdf'), 'comprobante.pdf');

      // Verify that estatusPago was updated
      const getResponse = await request(app)
        .get('/api/membresias/1');

      expect(getResponse.body.data.estatusPago).toBe(true);
    });
  });

  /** ==========================================
   *   APPROVAL OF APPLICATIONS
   *  ==========================================
   */
  describe('POST /api/membresias/:id/aprobar - Aprobar solicitud', () => {
    beforeEach(async () => {
      // Create a new application with payment
      await request(app)
        .post('/api/membership-applications')
        .send({
          nombres: 'Juan',
          apellidos: 'Pérez García',
          email: 'juan@ejemplo.com',
          pais: 'México',
          estado: 'Querétaro',
          ciudad: 'Querétaro'
        });
    });

    it('should approve application with payment proof', async () => {
      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf-content'), 'comprobante.pdf');

      const response = await request(app)
        .post('/api/membresias/1/aprobar');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('nuevo miembro forma parte de la sociedad');
      
      // Validate that the status was updated
      expect(response.body.data.aceptado).toBe(1);
    });

    it('should reject approval without payment proof', async () => {
      const response = await request(app)
        .post('/api/membresias/2/aprobar');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('comprobante de pago');
    });

    it('should send email to member on approval', async () => {
      const { SESClient } = require('@aws-sdk/client-ses');
      const mockSend = jest.fn().mockResolvedValue({ MessageId: 'test-id' });
      
      SESClient.mockImplementation(() => ({
        send: mockSend
      }));

      // Upload receipt and approve
      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf'), 'comprobante.pdf');

      await request(app)
        .post('/api/membresias/1/aprobar');

      // Verify that SES was called to send the email
      expect(mockSend).toHaveBeenCalled();
      
      // Verify that was send two emails (member + admin)
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should send copy to administrator', async () => {
      const { SendEmailCommand } = require('@aws-sdk/client-ses');
      
      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf'), 'comprobante.pdf');

      await request(app)
        .post('/api/membresias/1/aprobar');

      // Verify that one of the emails is for admin
      const calls = SendEmailCommand.mock.calls;
      const adminEmail = calls.find(call => 
        call[0].Destination.ToAddresses.includes('admin@fisiomax.com')
      );
      
      expect(adminEmail).toBeDefined();
    });

    it('should handle SES errors gracefully', async () => {
      const { SESClient } = require('@aws-sdk/client-ses');
      const mockSend = jest.fn().mockRejectedValue(new Error('SES Error'));
      
      SESClient.mockImplementation(() => ({
        send: mockSend
      }));

      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf'), 'comprobante.pdf');

      const response = await request(app)
        .post('/api/membresias/1/aprobar');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Error al enviar notificación');
    });
  });

  /** ==========================================
   *   REQUESTS REJECTION
   *  ==========================================
   */
  describe('POST /api/membresias/:id/rechazar - Rechazar solicitud', () => {
    it('should reject application with valid reason', async () => {
      const rejectData = {
        motivoRechazo: 'Documentación incompleta. Falta constancia de estudios actualizada.'
      };

      const response = await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('solicitud ha sido rechazada');
      
      // VALIDATE THAT THE STATUS WAS SAVED
      expect(response.body.data.aceptado).toBe(0);
      expect(response.body.data.motivoRechazo).toBe(rejectData.motivoRechazo);
    });

    it('should return error for missing rejection reason', async () => {
      const response = await request(app)
        .post('/api/membresias/1/rechazar')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Motivo de rechazo es requerido');
    });

    it('should reject reason longer than 200 characters', async () => {
      const rejectData = {
        motivoRechazo: 'a'.repeat(201)
      };

      const response = await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('200 caracteres');
    });

    it('should accept reason with exactly 200 characters', async () => {
      const rejectData = {
        motivoRechazo: 'a'.repeat(200)
      };

      const response = await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should send email with rejection reason', async () => {
      const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
      const mockSend = jest.fn().mockResolvedValue({ MessageId: 'test-id' });
      
      SESClient.mockImplementation(() => ({
        send: mockSend
      }));

      const rejectData = {
        motivoRechazo: 'Documentación incompleta'
      };

      await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      // VERIFY THAT THE EMAIL WAS SENT 
      expect(mockSend).toHaveBeenCalled();
      
      // VERIFY THAT THE EMAIL CONTAINS THE REASON
      const emailCall = SendEmailCommand.mock.calls[0];
      expect(emailCall[0].Message.Body.Html.Data).toContain('Documentación incompleta');
    });

    it('should send copy to administrator with rejection reason', async () => {
      const { SendEmailCommand } = require('@aws-sdk/client-ses');

      const rejectData = {
        motivoRechazo: 'Documentación incompleta'
      };

      await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      // VERIFY ADMIN'S EMAIL
      const calls = SendEmailCommand.mock.calls;
      const adminEmail = calls.find(call => 
        call[0].Destination.ToAddresses.includes('admin@fisiomax.com')
      );
      
      expect(adminEmail).toBeDefined();
      expect(adminEmail[0].Message.Body.Html.Data).toContain('Documentación incompleta');
    });

    it('should handle special characters in rejection reason', async () => {
      const rejectData = {
        motivoRechazo: 'Motivo con acentos: áéíóú y símbolos: @#$%'
      };

      const response = await request(app)
        .post('/api/membresias/1/rechazar')
        .send(rejectData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.motivoRechazo).toBe(rejectData.motivoRechazo);
    });
  });

  /** ==========================================
   *   SECURITY AND PERMISSIONS
   *  ==========================================
   */
  
  describe('Security - Permission validation', () => {
    it('should reject approval without authentication', async () => {
      const response = await request(app)
        .post('/api/membresias/1/aprobar')
        .set('Authorization', ''); // Without token

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('autorizado');
    });

    it('should reject operations from non-admin users', async () => {
      const response = await request(app)
        .post('/api/membresias/1/aprobar')
        .set('Authorization', 'Bearer user-token'); // With a regular token

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permisos de administrador');
    });

    it('should allow operations with valid admin token', async () => {
      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf'), 'comprobante.pdf')
        .set('Authorization', 'Bearer admin-token');

      const response = await request(app)
        .post('/api/membresias/1/aprobar')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  /** ==========================================
   *   SOFTWARE PERFORMANCE
   * ==========================================
   */
  describe('Performance - Concurrent processing', () => {
    it('should process up to 10 applications simultaneously', async () => {
      const promises = [];

      // Create 10 applications with payment ticket
      for (let i = 1; i <= 10; i++) {
        promises.push(
          request(app)
            .post(`/api/membresias/${i}/aprobar`)
            .set('Authorization', 'Bearer admin-token')
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All must be completed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // It shouldn't take more than 5 seconds
      expect(totalTime).toBeLessThan(5000);
    });

    it('should send notifications in less than 1 minute', async () => {
      const { SESClient } = require('@aws-sdk/client-ses');
      const mockSend = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ MessageId: 'test-id' }), 500);
        });
      });
      
      SESClient.mockImplementation(() => ({
        send: mockSend
      }));

      await request(app)
        .post('/api/membresias/1/comprobante')
        .attach('comprobante', Buffer.from('pdf'), 'comprobante.pdf');

      const startTime = Date.now();
      
      await request(app)
        .post('/api/membresias/1/aprobar');

      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      expect(elapsedTime).toBeLessThan(60000);
    });
  });
});