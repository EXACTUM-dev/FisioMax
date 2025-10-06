/**
 * @fileoverview Script para probar la conexión a la base de datos
 * @version 1.0.0
 * @author EXACTUM-dev
 */
import MembershipApplicationDB, { db } from './src/models/membershipApplicationDB.js';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    
    // Crear pool de conexiones
    db.createPool();
    
    // Probar conexión básica
    const result = await db.query('SELECT 1 as test');
    console.log('✅ Conexión a la base de datos exitosa:', result);
    
    // Probar creación de solicitud
    console.log('🔄 Probando creación de solicitud...');
    const testData = {
      nombres: 'Test',
      apellidos: 'Usuario',
      email: 'test@ejemplo.com',
      pais: 'México',
      estado: 'Querétaro',
      ciudad: 'Querétaro'
    };
    
    const applicationId = await MembershipApplicationDB.create(testData);
    console.log('✅ Solicitud creada con ID:', applicationId);
    
    // Probar obtención de solicitud
    console.log('🔄 Probando obtención de solicitud...');
    const application = await MembershipApplicationDB.findById(applicationId);
    console.log('✅ Solicitud obtenida:', application.toJSON());
    
    // Probar listado de solicitudes
    console.log('🔄 Probando listado de solicitudes...');
    const applications = await MembershipApplicationDB.findAll({}, { page: 1, limit: 5 });
    console.log('✅ Solicitudes obtenidas:', applications.length, 'registros');
    
    // Probar conteo
    console.log('🔄 Probando conteo de solicitudes...');
    const count = await MembershipApplicationDB.count();
    console.log('✅ Total de solicitudes:', count);
    
    // Probar actualización de estado
    console.log('🔄 Probando actualización de estado...');
    const updatedApp = await MembershipApplicationDB.updateStatus(applicationId, 'aprobada', 'Prueba exitosa', 'test-script');
    console.log('✅ Estado actualizado:', updatedApp.estadoSolicitud);
    
    // Limpiar datos de prueba
    console.log('🔄 Limpiando datos de prueba...');
    await MembershipApplicationDB.delete(applicationId);
    console.log('✅ Datos de prueba eliminados');
    
    console.log('🎉 Todas las pruebas de base de datos pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas de base de datos:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión
    await db.close();
    console.log('🔌 Conexión a la base de datos cerrada');
    process.exit(0);
  }
}

// Ejecutar pruebas
testDatabaseConnection();
