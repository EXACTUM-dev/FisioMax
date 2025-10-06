/**
 * @fileoverview Modelo para solicitudes de membresía SOMEFIPP
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import joi from 'joi';

/**
 * Esquema de validación para solicitudes de membresía
 */
export const membershipApplicationSchema = joi.object({
  // Información personal
  nombres: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  apellidos: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Los apellidos deben tener al menos 2 caracteres',
      'string.max': 'Los apellidos no pueden exceder 50 caracteres',
      'any.required': 'Los apellidos son requeridos'
    }),
  
  telefono: joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono debe contener solo números, espacios, guiones, paréntesis y signo +',
      'string.min': 'El teléfono debe tener al menos 10 caracteres',
      'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),
  
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido'
    }),
  
  // Información de domicilio
  pais: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El país debe tener al menos 2 caracteres',
      'string.max': 'El país no puede exceder 50 caracteres',
      'any.required': 'El país es requerido'
    }),
  
  estado: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El estado debe tener al menos 2 caracteres',
      'string.max': 'El estado no puede exceder 50 caracteres',
      'any.required': 'El estado es requerido'
    }),
  
  ciudad: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'La ciudad debe tener al menos 2 caracteres',
      'string.max': 'La ciudad no puede exceder 50 caracteres',
      'any.required': 'La ciudad es requerida'
    }),
  
  colonia: joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'La colonia debe tener al menos 2 caracteres',
      'string.max': 'La colonia no puede exceder 100 caracteres'
    }),
  
  codigoPostal: joi.string()
    .pattern(/^\d{5}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El código postal debe tener exactamente 5 dígitos'
    }),
  
  // Información académica
  licenciatura: joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'La licenciatura debe tener al menos 2 caracteres',
      'string.max': 'La licenciatura no puede exceder 100 caracteres'
    })
});

/**
 * Esquema de validación para archivos
 */
export const fileSchema = joi.object({
  titulo: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    mimetype: joi.string().valid('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document').required(),
    size: joi.number().max(10 * 1024 * 1024).required() // 10MB máximo
  }).required(),
  
  cedula: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    mimetype: joi.string().valid('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document').required(),
    size: joi.number().max(10 * 1024 * 1024).required() // 10MB máximo
  }).required(),
  
  constancias: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    mimetype: joi.string().valid('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document').required(),
    size: joi.number().max(10 * 1024 * 1024).required() // 10MB máximo
  }).optional()
});

/**
 * Clase modelo para solicitudes de membresía
 */
export class MembershipApplication {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.telefono = data.telefono;
    this.email = data.email;
    this.pais = data.pais;
    this.estado = data.estado;
    this.ciudad = data.ciudad;
    this.colonia = data.colonia;
    this.codigoPostal = data.codigoPostal;
    this.licenciatura = data.licenciatura;
    this.documentos = data.documentos || {};
    this.estado = data.estado || 'pendiente'; // pendiente, aprobada, rechazada
    this.fechaSolicitud = data.fechaSolicitud || new Date().toISOString();
    this.fechaActualizacion = data.fechaActualizacion || new Date().toISOString();
    this.notas = data.notas || '';
  }

  /**
   * Genera un ID único para la solicitud
   */
  generateId() {
    return `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida los datos de la solicitud
   */
  validate() {
    const { error, value } = membershipApplicationSchema.validate(this);
    if (error) {
      throw new Error(`Error de validación: ${error.details.map(d => d.message).join(', ')}`);
    }
    return value;
  }

  /**
   * Convierte la instancia a objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      pais: this.pais,
      estado: this.estado,
      ciudad: this.ciudad,
      colonia: this.colonia,
      codigoPostal: this.codigoPostal,
      licenciatura: this.licenciatura,
      documentos: this.documentos,
      estado: this.estado,
      fechaSolicitud: this.fechaSolicitud,
      fechaActualizacion: this.fechaActualizacion,
      notas: this.notas
    };
  }

  /**
   * Actualiza el estado de la solicitud
   */
  updateStatus(newStatus, notas = '') {
    this.estado = newStatus;
    this.fechaActualizacion = new Date().toISOString();
    this.notas = notas;
  }
}

/**
 * Estados posibles para las solicitudes
 */
export const APPLICATION_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada',
  UNDER_REVIEW: 'en_revision'
};

/**
 * Tipos de documentos requeridos
 */
export const DOCUMENT_TYPES = {
  TITULO: 'titulo',
  CEDULA: 'cedula',
  CONSTANCIAS: 'constancias'
};
