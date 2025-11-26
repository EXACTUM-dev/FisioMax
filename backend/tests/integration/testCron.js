/**
 * @fileoverview Integration test for Cron Job
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Tests the notification cron job functionality.
 */

import { checkExpiringMemberships } from '../../src/services/notificationCronJob.js';



// Verify memberships expiring and sending notifications
try {
  await checkExpiringMemberships();

} catch (error) {
  console.error('Error:', error);
}

process.exit(0);