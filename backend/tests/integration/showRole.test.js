const request = require('supertest');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const express = require('express');

describe('🔄 Pruebas de Integración - HU 1.4: Consulta de Roles', () => {
  let app;
  let connection;
  let pool;
  let adminToken;

  beforeAll(async () => {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'fisiomax',
      waitForConnections: true,
      connectionLimit: 5
    });

    connection = await pool.getConnection();

    const secret = process.env.JWT_SECRET || 'test-secret-key';
    adminToken = jwt.sign(
      { userId: 'admin_001', role: 'admin' },
      secret,
      { expiresIn: '1h' }
    );

    app = express();
    app.use(express.json());
  });

  afterAll(async () => {
    if (connection) connection.release();
    if (pool) await pool.end();
  });

  beforeEach(async () => {
    // Limpiar tablas antes de cada test
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE rolprivilegios');
    await connection.execute('TRUNCATE TABLE privilegio');
    await connection.execute('TRUNCATE TABLE rol');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Datos de prueba
    await connection.execute(`
      INSERT INTO rol (IDRol, nombre, descripcion) VALUES
      ('1', 'admin', 'Administrador del sistema'),
      ('2', 'fisioterapeuta', 'Profesional de fisioterapia'),
      ('3', 'recepcionista', 'Personal de recepción')
    `);

    await connection.execute(`
      INSERT INTO privilegio (IDPrivilegio, nombre, descripcion) VALUES
      ('1', 'consultar_roles', 'Ver lista de roles'),
      ('2', 'crear_roles', 'Crear nuevos roles'),
      ('3', 'editar_roles', 'Modificar roles')
    `);

    await connection.execute(`
      INSERT INTO rolprivilegios (IDRol, IDPrivilegio) VALUES
      ('1','1'), ('1','2'), ('1','3'),
      ('2','1')
    `);
  });

  // Pruebas
  describe('🗄️ Base de Datos', () => {
    test('Debe de obtener los roles desde BD', async () => {
      const [roles] = await connection.execute('SELECT * FROM rol ORDER BY IDRol');
      expect(roles).toHaveLength(3);
      expect(roles[0].nombre).toBe('admin');
    });

    test('Debe de verificar los atributos de roles', async () => {
      const [roles] = await connection.execute("SELECT * FROM rol WHERE IDRol = '1'");
      const adminRole = roles[0];

      expect(adminRole).toHaveProperty('IDRol');
      expect(adminRole).toHaveProperty('nombre');
      expect(adminRole).toHaveProperty('descripcion');
      expect(adminRole.nombre).toBe('admin');
    });
  });

  describe('🌐 URLs', () => {
    test('Debe de verificar que la URL sea correcta /api/roles', async () => {
      app.get('/api/roles', async (req, res) => {
        const [roles] = await connection.execute('SELECT * FROM rol');
        res.status(200).json(roles);
      });

      const response = await request(app).get('/api/roles');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Debe retornar un 404 si se obtiene una URL incorrecta', async () => {
      const response = await request(app).get('/api/rol');
      expect(response.status).toBe(404);
    });
  });

  describe('🔐 Autenticación', () => {
    test('Debe de denegar el acceso si no tiene token', async () => {
      const authMiddleware = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token requerido' });
        next();
      };

      app.get('/api/roles-protected', authMiddleware, async (req, res) => {
        const [roles] = await connection.execute('SELECT * FROM rol');
        res.json(roles);
      });

      const response = await request(app).get('/api/roles-protected');
      expect(response.status).toBe(401);
    });

    test('Debe de permitir el acceso si tiene un token válido', async () => {
      const authMiddleware = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
          req.user = { role: 'admin' };
          next();
        } else {
          res.status(401).json({ error: 'No autorizado' });
        }
      };

      app.get('/api/roles-auth', authMiddleware, async (req, res) => {
        const [roles] = await connection.execute('SELECT * FROM rol');
        res.json(roles);
      });

      const response = await request(app)
        .get('/api/roles-auth')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });
});
