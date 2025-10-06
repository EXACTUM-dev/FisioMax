-- Esquema de base de datos para solicitudes de membresía SOMEFIPP
-- Ejecutar este script en tu base de datos MySQL

CREATE DATABASE IF NOT EXISTS fisiomax_db;
USE fisiomax_db;

-- Tabla para solicitudes de membresía
CREATE TABLE IF NOT EXISTS membership_applications (
    id VARCHAR(50) PRIMARY KEY,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    colonia VARCHAR(100),
    codigo_postal VARCHAR(10),
    licenciatura VARCHAR(100),
    estado_solicitud ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_estado (estado_solicitud),
    INDEX idx_fecha_solicitud (fecha_solicitud)
);

-- Tabla para documentos de las solicitudes
CREATE TABLE IF NOT EXISTS membership_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    document_type ENUM('titulo', 'cedula', 'constancias') NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES membership_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_document_type (document_type)
);

-- Tabla para logs de cambios de estado
CREATE TABLE IF NOT EXISTS membership_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    previous_status ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada'),
    new_status ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') NOT NULL,
    changed_by VARCHAR(100),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES membership_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_changed_at (changed_at)
);

-- Insertar datos de ejemplo (opcional)
INSERT INTO membership_applications (
    id, nombres, apellidos, email, pais, estado, ciudad, estado_solicitud
) VALUES (
    'MEM-EXAMPLE-001',
    'Juan',
    'Pérez García',
    'juan@ejemplo.com',
    'México',
    'Querétaro',
    'Querétaro',
    'pendiente'
) ON DUPLICATE KEY UPDATE nombres = nombres;
