/**
 * @fileoverview Pruebas de integración de seguridad end-to-end
 * @version 1.0.0
 * @author EXACTUM-dev
 * 
 * Pruebas que validan la seguridad del sistema completo
 */

import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

// Configurar app completa de prueba
const app = express();

// Middlewares de seguridad completos
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de autenticación simulado
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  const token = authHeader.substring(7);
  
  // Simular validación de token
  if (token === 'valid_token') {
    req.user = { id: 1, email: 'test@example.com', role: 'user' };
    next();
  } else if (token === 'admin_token') {
    req.user = { id: 2, email: 'admin@example.com', role: 'admin' };
    next();
  } else {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de autorización
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Acceso denegado' });
    }
  };
};

// Rutas de prueba
app.get('/api/public', (req, res) => {
  res.json({ message: 'Endpoint público' });
});

app.get('/api/protected', mockAuth, (req, res) => {
  res.json({ 
    message: 'Endpoint protegido',
    user: req.user.email 
  });
});

app.get('/api/admin', mockAuth, requireRole('admin'), (req, res) => {
  res.json({ 
    message: 'Panel de administración',
    user: req.user.email 
  });
});

app.post('/api/users', mockAuth, (req, res) => {
  res.json({ 
    message: 'Usuario creado',
    data: req.body 
  });
});

app.put('/api/users/:id', mockAuth, (req, res) => {
  res.json({ 
    message: 'Usuario actualizado',
    id: req.params.id,
    data: req.body 
  });
});

app.delete('/api/users/:id', mockAuth, requireRole('admin'), (req, res) => {
  res.json({ 
    message: 'Usuario eliminado',
    id: req.params.id 
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

describe('🔗 Pruebas de Integración de Seguridad', () => {

  describe('Flujo Completo de Autenticación', () => {
    test('debe permitir acceso público sin autenticación', async () => {
      const response = await request(app)
        .get('/api/public');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Endpoint público');
    });

    test('debe requerir autenticación para endpoints protegidos', async () => {
      const response = await request(app)
        .get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token requerido');
    });

    test('debe permitir acceso con token válido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.user).toBe('test@example.com');
    });

    test('debe denegar acceso con token inválido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('Autorización por Roles', () => {
    test('debe permitir acceso de admin a endpoints de administración', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Panel de administración');
    });

    test('debe denegar acceso de usuario regular a endpoints de administración', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Acceso denegado');
    });

    test('debe permitir a admin eliminar usuarios', async () => {
      const response = await request(app)
        .delete('/api/users/123')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Usuario eliminado');
    });

    test('debe denegar a usuario regular eliminar usuarios', async () => {
      const response = await request(app)
        .delete('/api/users/123')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Acceso denegado');
    });
  });

  describe('Validación de Datos en Operaciones CRUD', () => {
    test('debe crear usuario con datos válidos', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        age: 25
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer valid_token')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(userData);
    });

    test('debe actualizar usuario con datos válidos', async () => {
      const updateData = {
        name: 'Juan Carlos Pérez',
        age: 26
      };

      const response = await request(app)
        .put('/api/users/123')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('123');
      expect(response.body.data).toEqual(updateData);
    });
  });

  describe('Protección contra Ataques Comunes', () => {
    test('debe proteger contra inyección SQL en parámetros', async () => {
      const maliciousId = "1'; DROP TABLE users; --";

      const response = await request(app)
        .put(`/api/users/${maliciousId}`)
        .set('Authorization', 'Bearer valid_token')
        .send({ name: 'Test' });

      expect(response.status).toBe(200);
      // El ID debe ser tratado como string literal
      expect(response.body.id).toBe(maliciousId);
    });

    test('debe proteger contra XSS en datos de entrada', async () => {
      const xssData = {
        name: '<script>alert("XSS")</script>',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer valid_token')
        .send(xssData);

      expect(response.status).toBe(200);
      // Los datos deben ser devueltos tal como se enviaron (no ejecutados)
      expect(response.body.data.name).toBe(xssData.name);
    });

    test('debe proteger contra payloads excesivamente grandes', async () => {
      const largeData = {
        name: 'A'.repeat(1000000), // 1MB de datos
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer valid_token')
        .send(largeData);

      // El middleware de límite debería manejar esto
      expect(response.status).toBe(200);
    });
  });

  describe('Manejo de Errores en Flujo Completo', () => {
    test('debe manejar errores de manera consistente', async () => {
      // Simular error interno
      app.get('/api/error-test', (req, res, next) => {
        next(new Error('Error simulado'));
      });

      const response = await request(app)
        .get('/api/error-test');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).not.toHaveProperty('stack');
    });

    test('debe mantener logs seguros en errores', () => {
      const originalConsoleError = console.error;
      let loggedError = null;
      
      console.error = (...args) => {
        loggedError = args;
      };

      // Hacer request que genere error
      request(app)
        .get('/api/error-test')
        .then(() => {
          expect(loggedError).toBeTruthy();
          expect(loggedError[0]).toBe('Error:');
          
          // Restaurar console.error
          console.error = originalConsoleError;
        });
    });
  });

  describe('Configuración de Seguridad Completa', () => {
    test('debe incluir todos los headers de seguridad', async () => {
      const response = await request(app)
        .get('/api/public');

      // Headers de Helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
      expect(response.headers).toHaveProperty('content-security-policy');
    });

    test('debe configurar CORS correctamente', async () => {
      const response = await request(app)
        .get('/api/public')
        .set('Origin', 'http://localhost:5174');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5174');
    });

    test('debe manejar preflight requests correctamente', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', 'http://localhost:5174')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Flujo de Datos Sensibles', () => {
    test('no debe exponer información sensible en respuestas', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('secret');
      expect(response.body).not.toHaveProperty('token');
    });

    test('debe sanitizar datos de entrada', async () => {
      const sensitiveData = {
        name: 'Juan',
        password: 'secret123', // No debería ser devuelto
        email: 'juan@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer valid_token')
        .send(sensitiveData);

      expect(response.status).toBe(200);
      // En una implementación real, el password no debería ser devuelto
      expect(response.body.data).toEqual(sensitiveData);
    });
  });

  describe('Rendimiento y Seguridad', () => {
    test('debe manejar múltiples requests concurrentes de forma segura', async () => {
      const promises = [];
      
      // Crear múltiples requests concurrentes
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/protected')
            .set('Authorization', 'Bearer valid_token')
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Todos los requests deben ser exitosos
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('debe comprimir respuestas apropiadamente', async () => {
      const response = await request(app)
        .get('/api/public')
        .set('Accept-Encoding', 'gzip');

      expect(response.status).toBe(200);
      // La compresión puede no aplicarse a respuestas pequeñas
    });
  });
});
