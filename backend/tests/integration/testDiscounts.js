/**
 * @fileoverview Integration test for Discounts
 * @description Tests the discount retrieval functionality using existing data.
 */
import 'dotenv/config';

import {
  getActiveDiscounts,
  getDiscountsStartingToday,
  getExpiredDiscounts
} from '../../src/models/discount.model.js';
import { checkAndNotifyNewDiscounts } from '../../src/services/notificationCronJob.js';

console.log('Ejecutando prueba de Descuentos...\n');

async function testDiscounts() {
  try {
    console.log('--- Obteniendo descuentos activos ---');
    const activeDiscounts = await getActiveDiscounts();
    console.log(`Encontrados: ${activeDiscounts.length}`);
    console.log(JSON.stringify(activeDiscounts, null, 2));

    console.log('\n--- Obteniendo descuentos que inician hoy ---');
    const startingToday = await getDiscountsStartingToday();
    console.log(`Encontrados: ${startingToday.length}`);
    console.log(JSON.stringify(startingToday, null, 2));

    console.log('\n--- Obteniendo descuentos expirados ---');
    const expiredDiscounts = await getExpiredDiscounts();
    console.log(`Encontrados: ${expiredDiscounts.length}`);
    console.log(JSON.stringify(expiredDiscounts, null, 2));

    console.log('\n--- Ejecutando envío de notificaciones de descuentos (Simulación Cron) ---');
    await checkAndNotifyNewDiscounts();

    console.log('\nPrueba completada.');
  } catch (error) {
    console.error('Error durante la prueba:', error);
  }
}

testDiscounts().then(() => process.exit(0));
