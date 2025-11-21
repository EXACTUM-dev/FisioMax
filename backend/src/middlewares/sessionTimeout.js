/**
 * @fileoverview Session timeout middleware for tracking user inactivity.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Tracks user activity and enforces session expiration after 30 minutes of inactivity.
 */

/**
 * Session timeout duration in milliseconds (30 minutes).
 * @const {number}
 */
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * In-memory store for tracking last activity time per user.
 * Key: userId (Clerk ID)
 * Value: timestamp of last activity
 * @type {Map<string, number>}
 */
const activityTracker = new Map();

/**
 * Middleware to track user activity and enforce session timeout.
 * Updates the last activity timestamp for authenticated users
 * and validates if the session has expired due to inactivity.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.auth - Clerk authentication object (added by requireAuth).
 * @param {string} req.auth.userId - The Clerk user ID.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @return {Promise<void>}
 */
export const sessionTimeoutMiddleware = async (req, res, next) => {
  try {
    // Only track activity for authenticated requests
    if (!req.auth || !req.auth.userId) {
      return next();
    }

    const userId = req.auth.userId;
    const currentTime = Date.now();
    const lastActivity = activityTracker.get(userId);

    // Check if session has expired
    if (lastActivity && (currentTime - lastActivity) > SESSION_TIMEOUT) {
      // Session expired due to inactivity
      activityTracker.delete(userId);
      return res.status(401).json({
        error: 'Sesión expirada por inactividad',
        code: 'SESSION_EXPIRED',
        timestamp: new Date().toISOString(),
      });
    }

    // Update last activity timestamp
    activityTracker.set(userId, currentTime);

    next();
  } catch (error) {
    console.error('Error in sessionTimeoutMiddleware:', error);
    // Don't block the request due to tracking errors
    next();
  }
};

/**
 * Cleanup function to remove old entries from the activity tracker.
 * Should be called periodically to prevent memory leaks.
 * Removes entries older than SESSION_TIMEOUT.
 */
export const cleanupInactiveSessions = () => {
  const currentTime = Date.now();
  for (const [userId, lastActivity] of activityTracker.entries()) {
    if ((currentTime - lastActivity) > SESSION_TIMEOUT) {
      activityTracker.delete(userId);
    }
  }
};

// Run cleanup every 10 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupInactiveSessions, 10 * 60 * 1000);
}

/**
 * Manually clear a user's session from the activity tracker.
 * Useful for logout or forced session termination.
 *
 * @param {string} userId - The Clerk user ID.
 */
export const clearUserSession = (userId) => {
  activityTracker.delete(userId);
};

/**
 * Get the last activity time for a user.
 * Useful for debugging or monitoring.
 *
 * @param {string} userId - The Clerk user ID.
 * @return {number|null} Timestamp of last activity or null if not found.
 */
export const getLastActivity = (userId) => {
  return activityTracker.get(userId) || null;
};
