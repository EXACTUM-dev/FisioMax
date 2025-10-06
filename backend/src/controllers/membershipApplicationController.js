/**
 * @fileoverview Controlador para solicitudes de membresía SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import { MembershipApplication, APPLICATION_STATUS, DOCUMENT_TYPES } from '../models/membershipApplication.js';
import MembershipApplicationDB from '../models/membershipApplicationDB.js';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar SES
const sesClient = new SESClient({
  region: 'us-east-2',
});

/**
 * Controlador para crear una nueva solicitud de membresía
 */
export const createMembershipApplication = async (req, res) => {
  try {
    const { nombres, apellidos, telefono, email, pais, estado, ciudad, colonia, codigoPostal, licenciatura } = req.body;
    
    // Validar datos usando el modelo original
    const applicationData = {
      nombres,
      apellidos,
      telefono,
      email,
      pais,
      estado,
      ciudad,
      colonia,
      codigoPostal,
      licenciatura
    };

    const application = new MembershipApplication(applicationData);
    application.validate(); // Validar datos

    // Crear solicitud en la base de datos
    const applicationId = await MembershipApplicationDB.create(applicationData);

    // Guardar archivos si existen
    if (req.files) {
      const uploadDir = path.join(__dirname, '../../uploads/membership');
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Procesar cada archivo
      for (const [fieldName, file] of Object.entries(req.files)) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${applicationId}_${fieldName}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);
        
        // Guardar archivo
        fs.writeFileSync(filePath, file.buffer);
        
        // Guardar información del documento en la BD
        await MembershipApplicationDB.saveDocument(applicationId, {
          type: fieldName,
          originalName: file.originalname,
          fileName: fileName,
          filePath: filePath,
          size: file.size,
          mimetype: file.mimetype
        });
      }
    }

    // Obtener la solicitud completa de la BD
    const savedApplication = await MembershipApplicationDB.findById(applicationId);
    
    // Enviar email de confirmación
    await sendConfirmationEmail(savedApplication);
    
    // Enviar email de notificación a administradores
    await sendAdminNotificationEmail(savedApplication);

    res.status(201).json({
      success: true,
      message: 'Solicitud de membresía enviada correctamente',
      data: {
        id: savedApplication.id,
        nombres: savedApplication.nombres,
        apellidos: savedApplication.apellidos,
        email: savedApplication.email,
        estado: savedApplication.estadoSolicitud,
        fechaSolicitud: savedApplication.fechaSolicitud
      }
    });

  } catch (error) {
    console.error('Error creando solicitud de membresía:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar la solicitud de membresía'
    });
  }
};

/**
 * Controlador para obtener todas las solicitudes de membresía
 */
export const getMembershipApplications = async (req, res) => {
  try {
    const { estado, email, fechaDesde, fechaHasta, page = 1, limit = 10 } = req.query;
    
    // Construir filtros
    const filters = {};
    if (estado) filters.estado = estado;
    if (email) filters.email = email;
    if (fechaDesde) filters.fechaDesde = fechaDesde;
    if (fechaHasta) filters.fechaHasta = fechaHasta;
    
    // Obtener solicitudes con paginación
    const applications = await MembershipApplicationDB.findAll(filters, { page: parseInt(page), limit: parseInt(limit) });
    
    // Obtener total para paginación
    const total = await MembershipApplicationDB.count(filters);
    
    res.json({
      success: true,
      data: applications.map(app => app.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes de membresía'
    });
  }
};

/**
 * Controlador para obtener una solicitud específica por ID
 */
export const getMembershipApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await MembershipApplicationDB.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de membresía no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: application.toJSON()
    });

  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la solicitud de membresía'
    });
  }
};

/**
 * Controlador para actualizar el estado de una solicitud
 */
export const updateMembershipApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;
    
    // Validar estado
    const validStatuses = Object.values(APPLICATION_STATUS);
    if (!validStatuses.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`
      });
    }
    
    // Actualizar estado en la base de datos
    const updatedApplication = await MembershipApplicationDB.updateStatus(id, estado, notas, req.user?.email || 'admin');
    
    // Enviar email de notificación al solicitante
    await sendStatusUpdateEmail(updatedApplication);
    
    res.json({
      success: true,
      message: 'Estado de solicitud actualizado correctamente',
      data: updatedApplication.toJSON()
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar el estado de la solicitud'
    });
  }
};

/**
 * Controlador para descargar un documento de una solicitud
 */
export const downloadDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params;
    
    const application = await MembershipApplicationDB.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de membresía no encontrada'
      });
    }
    
    const document = await MembershipApplicationDB.getDocument(id, documentType);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    // Verificar que el archivo existe
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }
    
    // Enviar archivo
    res.download(document.file_path, document.original_name);

  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el documento'
    });
  }
};

/**
 * Envía email de confirmación al solicitante
 */
const sendConfirmationEmail = async (application) => {
  try {
    const params = {
      Source: 'trujillo_jaime@outlook.com',
      Destination: {
        ToAddresses: [application.email],
      },
      Message: {
        Subject: {
          Data: 'Confirmación de Solicitud de Membresía - SOMEFIPP',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <h2>¡Solicitud de Membresía Recibida!</h2>
              <p>Estimado/a ${application.nombres} ${application.apellidos},</p>
              <p>Hemos recibido su solicitud de membresía para la Sociedad Mexicana de Fisioterapia en Piso Pélvico (SOMEFIPP).</p>
              
              <h3>Detalles de su solicitud:</h3>
              <ul>
                <li><strong>ID de Solicitud:</strong> ${application.id}</li>
                <li><strong>Fecha de Solicitud:</strong> ${new Date(application.fechaSolicitud).toLocaleDateString('es-MX')}</li>
                <li><strong>Estado:</strong> ${application.estado}</li>
              </ul>
              
              <p>Su solicitud será revisada por nuestro comité de membresía. Le notificaremos el resultado por correo electrónico.</p>
              
              <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
              
              <p>Saludos cordiales,<br>
              Equipo SOMEFIPP</p>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
  }
};

/**
 * Envía email de notificación a administradores
 */
const sendAdminNotificationEmail = async (application) => {
  try {
    const params = {
      Source: 'trujillo_jaime@outlook.com',
      Destination: {
        ToAddresses: ['admin@somefipp.com'], // Email de administradores
      },
      Message: {
        Subject: {
          Data: `Nueva Solicitud de Membresía - ${application.nombres} ${application.apellidos}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <h2>Nueva Solicitud de Membresía</h2>
              <p>Se ha recibido una nueva solicitud de membresía que requiere revisión.</p>
              
              <h3>Información del Solicitante:</h3>
              <ul>
                <li><strong>Nombre:</strong> ${application.nombres} ${application.apellidos}</li>
                <li><strong>Email:</strong> ${application.email}</li>
                <li><strong>Teléfono:</strong> ${application.telefono || 'No proporcionado'}</li>
                <li><strong>País:</strong> ${application.pais}</li>
                <li><strong>Estado:</strong> ${application.estado}</li>
                <li><strong>Ciudad:</strong> ${application.ciudad}</li>
                <li><strong>Licenciatura:</strong> ${application.licenciatura || 'No especificada'}</li>
                <li><strong>ID de Solicitud:</strong> ${application.id}</li>
              </ul>
              
              <p>Documentos adjuntos: ${Object.keys(application.documentos).length} archivo(s)</p>
              
              <p>Por favor, revise la solicitud en el panel de administración.</p>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    
  } catch (error) {
    console.error('Error enviando email de notificación a admin:', error);
  }
};

/**
 * Envía email de actualización de estado al solicitante
 */
const sendStatusUpdateEmail = async (application) => {
  try {
    let statusMessage = '';
    let statusTitle = '';
    
    switch (application.estado) {
      case APPLICATION_STATUS.APPROVED:
        statusTitle = '¡Solicitud Aprobada!';
        statusMessage = 'Su solicitud de membresía ha sido aprobada. ¡Bienvenido a SOMEFIPP!';
        break;
      case APPLICATION_STATUS.REJECTED:
        statusTitle = 'Solicitud Rechazada';
        statusMessage = 'Su solicitud de membresía ha sido rechazada.';
        break;
      case APPLICATION_STATUS.UNDER_REVIEW:
        statusTitle = 'Solicitud en Revisión';
        statusMessage = 'Su solicitud está siendo revisada por nuestro comité.';
        break;
      default:
        statusTitle = 'Actualización de Solicitud';
        statusMessage = 'Su solicitud ha sido actualizada.';
    }
    
    const params = {
      Source: 'trujillo_jaime@outlook.com',
      Destination: {
        ToAddresses: [application.email],
      },
      Message: {
        Subject: {
          Data: `${statusTitle} - SOMEFIPP`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <h2>${statusTitle}</h2>
              <p>Estimado/a ${application.nombres} ${application.apellidos},</p>
              <p>${statusMessage}</p>
              
              <h3>Detalles de su solicitud:</h3>
              <ul>
                <li><strong>ID de Solicitud:</strong> ${application.id}</li>
                <li><strong>Estado Actual:</strong> ${application.estado}</li>
                <li><strong>Fecha de Actualización:</strong> ${new Date(application.fechaActualizacion).toLocaleDateString('es-MX')}</li>
              </ul>
              
              ${application.notas ? `<p><strong>Notas adicionales:</strong> ${application.notas}</p>` : ''}
              
              <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
              
              <p>Saludos cordiales,<br>
              Equipo SOMEFIPP</p>
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    
  } catch (error) {
    console.error('Error enviando email de actualización:', error);
  }
};
