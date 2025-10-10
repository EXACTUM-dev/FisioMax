/**
 * @fileoverview Configuración de conexión a la base de datos MySQL.
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Maneja la conexión y pool de conexiones a MySQL usando mysql2.
 */

import mysql from 'mysql2/promise';
import config from '../../config.js';

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Función para obtener una conexión del pool
export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error al obtener conexión de la base de datos:', error);
    throw error;
  }
};

// Función para ejecutar una query
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error al ejecutar query:', error);
    throw error;
  }
};

// Función para cerrar el pool de conexiones
export const closePool = async () => {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('Error al cerrar el pool de conexiones:', error);
    throw error;
  }
};

// Exportar el pool como default para compatibilidad
export default {
  getConnection,
  query,
  closePool
};
