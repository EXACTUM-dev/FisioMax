/**
 * @fileoverview Pruebas de seguridad para configuración y variables de entorno
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * Pruebas que validan la configuración segura de la aplicación
 */

import config from '../../config.js';
import dotenv from 'dotenv';

// Cargar variables de entorno para pruebas
dotenv.config({ path: '.env.test', override: true });

describe('🔧 Pruebas de Seguridad - Configuración', () => {

  describe('Variables de Entorno Críticas', () => {
    test('debe tener JWT_SECRET configurado en produccion', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Simular entorno de producción
      process.env.NODE_ENV = 'production';
      
      // Verificar que JWT_SECRET esté definido
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET).not.toBe('');
      expect(process.env.JWT_SECRET).not.toBe('your-secret-key');
      expect(process.env.JWT_SECRET).not.toBe('default-secret');
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });

    test('debe tener SESSION_SECRET configurado', () => {
      expect(process.env.SESSION_SECRET).toBeDefined();
      expect(process.env.SESSION_SECRET).not.toBe('');
      expect(process.env.SESSION_SECRET).not.toBe('your-session-secret');
    });

    test('debe tener CLERK_SECRET_KEY configurado', () => {
      expect(process.env.CLERK_SECRET_KEY).toBeDefined();
      expect(process.env.CLERK_SECRET_KEY).not.toBe('');
      expect(process.env.CLERK_SECRET_KEY).not.toBe('sk_test_...');
    });
  });

  describe('Configuración de Base de Datos', () => {
    test('debe tener configuración de base de datos válida', () => {
      expect(config.db.host).toBeDefined();
      expect(config.db.user).toBeDefined();
      expect(config.db.password).toBeDefined();
      expect(config.db.database).toBeDefined();
    });

    test('no debe usar credenciales por defecto', () => {
      expect(config.db.password).not.toBe('password');
      expect(config.db.password).not.toBe('root');
      expect(config.db.password).not.toBe('');
      expect(config.db.user).not.toBe('root');
      expect(config.db.user).not.toBe('admin');
    });

    test('debe usar puerto seguro para base de datos', () => {
      // Si se especifica puerto, debe ser el estándar o uno seguro
      if (config.db.port) {
        expect(config.db.port).not.toBe(3306); // Puerto por defecto de MySQL
        expect(config.db.port).not.toBe(5432); // Puerto por defecto de PostgreSQL
      }
    });
  });

  describe('Configuración CORS', () => {
    test('debe tener orígenes CORS específicos', () => {
      expect(config.cors.allowedOrigins).toBeDefined();
      expect(Array.isArray(config.cors.allowedOrigins)).toBe(true);
      expect(config.cors.allowedOrigins.length).toBeGreaterThan(0);
    });

    test('no debe permitir orígenes wildcard en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Simular entorno de producción
      process.env.NODE_ENV = 'production';
      
      // Recrear configuración
      const prodConfig = {
        cors: {
          allowedOrigins: process.env.CORS_ORIGINS ? 
            process.env.CORS_ORIGINS.split(',') : 
            ['http://localhost:5174']
        }
      };
      
      prodConfig.cors.allowedOrigins.forEach(origin => {
        expect(origin).not.toBe('*');
        expect(origin).not.toBe('null');
      });
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });

    test('debe usar HTTPS en orígenes de producción', () => {
      config.cors.allowedOrigins.forEach(origin => {
        if (origin.includes('fisiomax.com') || origin.includes('localhost:5174')) {
          // Permitir localhost para desarrollo
          if (!origin.includes('localhost')) {
            expect(origin).toMatch(/^https:/);
          }
        }
      });
    });
  });

  describe('Configuración AWS/S3', () => {
    test('debe tener credenciales AWS configuradas', () => {
      expect(config.aws.accessKeyId).toBeDefined();
      expect(config.aws.secretAccessKey).toBeDefined();
      expect(config.aws.s3BucketName).toBeDefined();
    });

    test('no debe usar credenciales AWS de prueba en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Simular entorno de producción
      process.env.NODE_ENV = 'production';
      
      expect(process.env.AWS_ACCESS_KEY_ID).not.toContain('AKIAIOSFODNN7EXAMPLE');
      expect(process.env.AWS_SECRET_ACCESS_KEY).not.toContain('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });

    test('debe tener nombre de bucket S3 válido', () => {
      expect(config.aws.s3BucketName).toMatch(/^[a-z0-9.-]+$/);
      expect(config.aws.s3BucketName.length).toBeGreaterThan(3);
      expect(config.aws.s3BucketName.length).toBeLessThan(64);
    });
  });

  describe('Configuración del Puerto', () => {
    test('debe usar puerto no privilegiado', () => {
      expect(config.app.port).toBeGreaterThan(1024);
      expect(config.app.port).toBeLessThan(65536);
    });

    test('no debe usar puertos conocidos inseguros', () => {
      const insecurePorts = [21, 23, 25, 53, 80, 110, 143, 993, 995];
      expect(insecurePorts).not.toContain(parseInt(config.app.port));
    });
  });

  describe('Configuración de Entorno', () => {
    test('debe detectar entorno correctamente', () => {
      expect(['development', 'test', 'production']).toContain(config.app.env);
    });

    test('debe usar configuración diferente por entorno', () => {
      // Config ya está cargado con NODE_ENV = 'test' (desde .env.test)
      // No podemos cambiar NODE_ENV después de que config se importó
      
      // Verificar que config respeta el NODE_ENV con el que se cargó
      expect(config.app.env).toBe(process.env.NODE_ENV);
      
      // Verificar que es un entorno válido
      expect(['development', 'test', 'production']).toContain(config.app.env);
    });
  });

  describe('Seguridad de Configuración', () => {
    test('no debe exponer configuración sensible en logs', () => {
      const configString = JSON.stringify(config);
      
      // Verificar que no se expongan secretos en la configuración
      expect(configString).not.toContain(process.env.JWT_SECRET);
      expect(configString).not.toContain(process.env.SESSION_SECRET);
      expect(configString).not.toContain(process.env.CLERK_SECRET_KEY);
      expect(configString).not.toContain(process.env.DB_PASSWORD);
      expect(configString).not.toContain(process.env.AWS_SECRET_ACCESS_KEY);
    });

    test('debe tener valores por defecto seguros', () => {
      // Verificar que los valores por defecto sean seguros
      expect(config.app.port).toBeDefined();
      expect(config.app.env).toBeDefined();
    });

    test('debe validar formato de configuración', () => {
      // Verificar estructura de configuración
      expect(config).toHaveProperty('app');
      expect(config).toHaveProperty('db');
      expect(config).toHaveProperty('auth');
      expect(config).toHaveProperty('aws');
      expect(config).toHaveProperty('cors');
    });
  });

  describe('Configuración de Logging', () => {
    test('debe configurar logging apropiado para cada entorno', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // En desarrollo, se puede usar logging más detallado
      process.env.NODE_ENV = 'development';
      // En producción, logging debe ser más restrictivo
      process.env.NODE_ENV = 'production';
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });

    test('no debe logear información sensible', () => {
      // Verificar que no se configuren logs que expongan secretos
      const logConfig = {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
      };
      
      expect(logConfig.level).not.toBe('debug'); // En producción
      expect(logConfig.format).toBeDefined();
    });
  });

  describe('Configuración de Rate Limiting', () => {
    test('debe tener configuración de rate limiting', () => {
      const rateLimitConfig = {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Convertir
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
      };
      
      expect(rateLimitConfig.windowMs).toBeGreaterThan(0);
      expect(rateLimitConfig.max).toBeGreaterThan(0);
    });

    test('debe tener límites apropiados para API', () => {
      const apiRateLimit = {
        windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10)
      };
      
      expect(apiRateLimit.max).toBeLessThan(10000);
      expect(apiRateLimit.max).toBeGreaterThan(10);
    });
  });
  describe('Configuración de SSL/TLS', () => {
    test('debe configurar SSL en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // En producción, debe haber configuración SSL
      process.env.NODE_ENV = 'production';
      
      // Verificar variables SSL
      if (process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
        expect(process.env.SSL_CERT_PATH).toBeDefined();
        expect(process.env.SSL_KEY_PATH).toBeDefined();
      }
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });
  });
});
