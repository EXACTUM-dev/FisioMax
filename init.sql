-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 07-10-2025 a las 21:39:42
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fisiomax`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accede`
--

DROP TABLE IF EXISTS `accede`;
CREATE TABLE IF NOT EXISTS `accede` (
  `IDContenido` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDUsuario` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`IDContenido`,`IDUsuario`),
  KEY `IDUsuario` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenido`
--

DROP TABLE IF EXISTS `contenido`;
CREATE TABLE IF NOT EXISTS `contenido` (
  `IDContenido` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDMultimedia` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `tipoMembresia` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`IDContenido`),
  UNIQUE KEY `IDMultimedia` (`IDMultimedia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentosadicionales`
--

DROP TABLE IF EXISTS `documentosadicionales`;
CREATE TABLE IF NOT EXISTS `documentosadicionales` (
  `IDDocumento` int NOT NULL AUTO_INCREMENT,
  `IDUsuario` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `nombreArchivo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `urlArchivo` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `eliminado` tinyint(1) DEFAULT '0',
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`IDDocumento`),
  KEY `idx_usuario` (`IDUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresia`
--

DROP TABLE IF EXISTS `membresia`;
CREATE TABLE IF NOT EXISTS `membresia` (
  `IDMembresia` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDUsuario` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaVencimiento` date NOT NULL,
  `constanciaPago` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `certificado` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `aceptado` tinyint(1) NOT NULL,
  PRIMARY KEY (`IDMembresia`),
  KEY `IDUsuario` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

DROP TABLE IF EXISTS `pago`;
CREATE TABLE IF NOT EXISTS `pago` (
  `IDPago` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDMembresia` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `folio` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaPago` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`IDPago`),
  UNIQUE KEY `folio` (`folio`),
  KEY `IDMembresia` (`IDMembresia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `privilegio`
--

DROP TABLE IF EXISTS `privilegio`;
CREATE TABLE IF NOT EXISTS `privilegio` (
  `IDPrivilegio` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`IDPrivilegio`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

DROP TABLE IF EXISTS `rol`;
CREATE TABLE IF NOT EXISTS `rol` (
  `IDRol` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `eliminado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`IDRol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rolprivilegios`
--

DROP TABLE IF EXISTS `rolprivilegios`;
CREATE TABLE IF NOT EXISTS `rolprivilegios` (
  `IDPrivilegio` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDRol` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `eliminado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`IDPrivilegio`,`IDRol`),
  KEY `IDRol` (`IDRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE IF NOT EXISTS `usuario` (
  `IDUsuario` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidoP` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidoM` char(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `foto` char(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaNacimiento` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `cedula` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `constancias` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `licenciatura` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pais` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` char(60) COLLATE utf8mb4_general_ci NOT NULL,
  `ciudad` char(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `colonia` char(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigoPostal` char(60) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `eliminado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`IDUsuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `telefono` (`telefono`),
  UNIQUE KEY `titulo` (`titulo`),
  UNIQUE KEY `cedula` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuariorol`
--

DROP TABLE IF EXISTS `usuariorol`;
CREATE TABLE IF NOT EXISTS `usuariorol` (
  `IDRol` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `IDUsuario` char(32) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  `eliminado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`IDRol`,`IDUsuario`),
  KEY `IDUsuario` (`IDUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accede`
--
ALTER TABLE `accede`
  ADD CONSTRAINT `Accede_ibfk_1` FOREIGN KEY (`IDContenido`) REFERENCES `contenido` (`IDContenido`),
  ADD CONSTRAINT `Accede_ibfk_2` FOREIGN KEY (`IDUsuario`) REFERENCES `usuario` (`IDUsuario`);

--
-- Filtros para la tabla `documentosadicionales`
--
ALTER TABLE `documentosadicionales`
  ADD CONSTRAINT `documentosadicionales_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuario` (`IDUsuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `membresia`
--
ALTER TABLE `membresia`
  ADD CONSTRAINT `Membresia_ibfk_1` FOREIGN KEY (`IDUsuario`) REFERENCES `usuario` (`IDUsuario`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `Pago_ibfk_1` FOREIGN KEY (`IDMembresia`) REFERENCES `membresia` (`IDMembresia`);

--
-- Filtros para la tabla `rolprivilegios`
--
ALTER TABLE `rolprivilegios`
  ADD CONSTRAINT `RolPrivilegios_ibfk_1` FOREIGN KEY (`IDPrivilegio`) REFERENCES `privilegio` (`IDPrivilegio`),
  ADD CONSTRAINT `RolPrivilegios_ibfk_2` FOREIGN KEY (`IDRol`) REFERENCES `rol` (`IDRol`);

--
-- Filtros para la tabla `usuariorol`
--
ALTER TABLE `usuariorol`
  ADD CONSTRAINT `UsuarioRol_ibfk_1` FOREIGN KEY (`IDRol`) REFERENCES `rol` (`IDRol`),
  ADD CONSTRAINT `UsuarioRol_ibfk_2` FOREIGN KEY (`IDUsuario`) REFERENCES `usuario` (`IDUsuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================
-- INSERTS PARA LA BASE DE DATOS FISIOMAX
-- ============================================

-- --------------------------------------------------------
-- 1. TABLA: rol
-- --------------------------------------------------------
INSERT INTO `rol` (`IDRol`, `nombre`, `descripcion`, `createdAt`, `deletedAt`, `eliminado`) VALUES
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'Administrador', 'Acceso completo al sistema', NOW(), NULL, 0),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', 'Fisioterapeuta', 'Profesional de fisioterapia con acceso a contenido premium', NOW(), NULL, 0);

-- --------------------------------------------------------
-- 2. TABLA: privilegio
-- --------------------------------------------------------
INSERT INTO `privilegio` (`IDPrivilegio`, `nombre`, `descripcion`, `createdAt`, `deletedAt`) VALUES
('p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6', 'Gestionar Usuarios', 'Permite crear, editar y eliminar usuarios del sistema', NOW(), NULL),
('q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7', 'Ver Contenido Premium', 'Permite acceder a contenido exclusivo de membresía', NOW(), NULL);

-- --------------------------------------------------------
-- 3. TABLA: rolprivilegios (relación rol-privilegio)
-- --------------------------------------------------------
INSERT INTO `rolprivilegios` (`IDPrivilegio`, `IDRol`, `createdAt`, `deletedAt`, `eliminado`) VALUES
('p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', NOW(), NULL, 0),
('q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7', 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', NOW(), NULL, 0);

-- --------------------------------------------------------
-- 4. TABLA: usuario
-- --------------------------------------------------------
INSERT INTO `usuario` (`IDUsuario`, `nombres`, `apellidoP`, `apellidoM`, `foto`, `correo`, `telefono`, `fechaNacimiento`, `cedula`, `titulo`, `constancias`, `licenciatura`, `pais`, `estado`, `ciudad`, `colonia`, `codigoPostal`, `createdAt`, `deletedAt`, `eliminado`) VALUES
('usr001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'María', 'González', 'López', NULL, 'maria.gonzalez@fisiomax.com', '4421234567', '1985-03-15', 'CED12345', 'titulo_maria.pdf', NULL, 'Fisioterapia', 'México', 'Querétaro', 'Santiago de Querétaro', 'Centro', '76000', NOW(), NULL, 0),
('usr002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'Carlos', 'Ramírez', 'Hernández', NULL, 'carlos.ramirez@fisiomax.com', '4429876543', '1990-07-22', 'CED67890', 'titulo_carlos.pdf', 'constancia_carlos.pdf', 'Kinesiología', 'México', 'Querétaro', 'Santiago de Querétaro', 'Juriquilla', '76230', NOW(), NULL, 0);

-- --------------------------------------------------------
-- 5. TABLA: usuariorol (relación usuario-rol)
-- --------------------------------------------------------
INSERT INTO `usuariorol` (`IDRol`, `IDUsuario`, `createdAt`, `deletedAt`, `eliminado`) VALUES
('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', 'usr001a1b2c3d4e5f6g7h8i9j0k1l2m3', NOW(), NULL, 0),
('b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', 'usr002b2c3d4e5f6g7h8i9j0k1l2m3n4', NOW(), NULL, 0);

-- --------------------------------------------------------
-- 6. TABLA: documentosadicionales
-- --------------------------------------------------------
INSERT INTO `documentosadicionales` (`IDUsuario`, `nombreArchivo`, `urlArchivo`, `createdAt`, `eliminado`, `deletedAt`) VALUES
('usr001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'certificado_especialidad.pdf', 'https://s3.amazonaws.com/fisiomax/docs/cert_maria_001.pdf', NOW(), 0, NULL),
('usr002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'diploma_curso_avanzado.pdf', 'https://s3.amazonaws.com/fisiomax/docs/diploma_carlos_001.pdf', NOW(), 0, NULL);

-- --------------------------------------------------------
-- 7. TABLA: membresia
-- --------------------------------------------------------
INSERT INTO `membresia` (`IDMembresia`, `IDUsuario`, `tipo`, `fechaVencimiento`, `constanciaPago`, `certificado`, `createdAt`, `deletedAt`, `aceptado`) VALUES
('mem001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'usr001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'Premium', '2026-01-15', 'pago_maria_2025.pdf', 'cert_maria_premium.pdf', NOW(), NULL, 1),
('mem002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'usr002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'Básica', '2025-12-31', 'pago_carlos_2025.pdf', 'cert_carlos_basica.pdf', NOW(), NULL, 1);

-- --------------------------------------------------------
-- 8. TABLA: pago
-- --------------------------------------------------------
INSERT INTO `pago` (`IDPago`, `IDMembresia`, `folio`, `cantidad`, `fechaPago`) VALUES
('pag001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'mem001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'FOL-2025-001234', '1500.00', NOW()),
('pag002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'mem002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'FOL-2025-005678', '800.00', NOW());

-- --------------------------------------------------------
-- 9. TABLA: contenido
-- --------------------------------------------------------
INSERT INTO `contenido` (`IDContenido`, `IDMultimedia`, `nombre`, `descripcion`, `tipo`, `tipoMembresia`, `createdAt`, `deletedAt`) VALUES
('cnt001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'video_001_tecnicas_masaje.mp4', 'Técnicas de Masaje Deportivo', 'Video tutorial sobre técnicas avanzadas de masaje para deportistas de alto rendimiento', 'Video', 'Premium', NOW(), NULL),
('cnt002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'articulo_001_rehabilitacion.pdf', 'Rehabilitación Post-Lesión', 'Artículo especializado sobre procesos de rehabilitación después de lesiones musculares', 'Artículo', 'Básica', NOW(), NULL);

-- --------------------------------------------------------
-- 10. TABLA: accede (relación usuario-contenido)
-- --------------------------------------------------------
INSERT INTO `accede` (`IDContenido`, `IDUsuario`) VALUES
('cnt001a1b2c3d4e5f6g7h8i9j0k1l2m3', 'usr001a1b2c3d4e5f6g7h8i9j0k1l2m3'),
('cnt002b2c3d4e5f6g7h8i9j0k1l2m3n4', 'usr002b2c3d4e5f6g7h8i9j0k1l2m3n4');

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Consultar todos los roles
SELECT * FROM rol;

-- Consultar todos los usuarios con sus roles
SELECT u.nombres, u.apellidoP, u.correo, r.nombre AS rol
FROM usuario u
INNER JOIN usuariorol ur ON u.IDUsuario = ur.IDUsuario
INNER JOIN rol r ON ur.IDRol = r.IDRol;

-- Consultar membresías activas
SELECT u.nombres, u.apellidoP, m.tipo, m.fechaVencimiento, m.aceptado
FROM membresia m
INNER JOIN usuario u ON m.IDUsuario = u.IDUsuario;

-- Consultar pagos realizados
SELECT p.folio, p.cantidad, p.fechaPago, m.tipo AS tipo_membresia, u.nombres, u.apellidoP
FROM pago p
INNER JOIN membresia m ON p.IDMembresia = m.IDMembresia
INNER JOIN usuario u ON m.IDUsuario = u.IDUsuario;

-- Consultar contenido y quién tiene acceso
SELECT c.nombre AS contenido, c.tipo, u.nombres, u.apellidoP
FROM contenido c
INNER JOIN accede a ON c.IDContenido = a.IDContenido
INNER JOIN usuario u ON a.IDUsuario = u.IDUsuario;
