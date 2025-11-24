/**
 * @fileoverview Test to delete old notifications from the database.
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description This script tests the cleanupOldNotifications function by invoking it directly.
 */

import { cleanupOldNotifications } from '../../src/services/cleanNotificationsCronJobs.js';

console.log('Ejecutando prueba de limpieza...\n');

try {
  await cleanupOldNotifications();
  console.log('\nPrueba completada!');
} catch (error) {
  console.error('Error:', error);
}

process.exit(0);