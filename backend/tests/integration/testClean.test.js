/**
 * @fileoverview Test to delete old notifications from the database.
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description This script tests the cleanupOldNotifications function by invoking it directly.
 */

import { cleanupOldNotifications } from '../../src/services/cleanNotificationsCronJobs.js';

describe('Cleanup Old Notifications', () => {
  it('should delete old read notifications', async () => {


    await expect(cleanupOldNotifications()).resolves.not.toThrow();


  });
});