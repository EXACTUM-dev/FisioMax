/**
 * @fileoverview Custom hook for handling session timeout and inactivity detection.
 * @version 1.1.0
 * @author EXACTUM-dev
 *
 * Monitors user activity and triggers logout after 30 minutes of inactivity.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import authConfig from '../config/auth.config.js';

/**
 * Events that indicate user activity
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

/**
 * Custom hook to handle session timeout due to inactivity.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout duration in milliseconds (default: 30 minutes)
 * @param {Function} options.onTimeout - Callback when session times out
 * @param {boolean} options.enabled - Whether the timeout is enabled (default: true)
 * @return {Object} Object with session status and controls
 */
export const useSessionTimeout = (options = {}) => {
  const {
    timeout = authConfig.sessionTimeout,
    onTimeout,
    enabled = true,
  } = options;

  const { signOut, isSignedIn } = useAuth();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const lastResetRef = useRef(Date.now());
  const isTimeoutHandledRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Keep onTimeout ref updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Throttle time: only reset timer if at least this many ms have passed since last reset
  const THROTTLE_MS = 10000; // 10 seconds

  // Set up activity listeners - only run once when enabled/isSignedIn changes
  useEffect(() => {
    if (!enabled || !isSignedIn) {
      return;
    }

    // Handle session timeout
    const handleTimeout = async () => {
      // Prevent multiple timeout executions
      if (isTimeoutHandledRef.current) return;
      isTimeoutHandledRef.current = true;

      // Show modal
      setShowExpiredModal(true);
      
      // Call custom timeout handler if provided
      if (onTimeoutRef.current) {
        onTimeoutRef.current();
      }

      // Wait a bit to show the modal, then sign out
      setTimeout(async () => {
        try {
          await signOut();
          window.location.href = '/';
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          window.location.href = '/';
        }
      }, 2000);
    };

    // Reset the inactivity timer
    const resetTimer = () => {
      // Reset the timeout handled flag
      isTimeoutHandledRef.current = false;
      lastActivityRef.current = Date.now();

      // Clear existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timer
      timeoutRef.current = setTimeout(() => {
        handleTimeout();
      }, timeout);
    };

    // Handle user activity
    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastReset = now - lastResetRef.current;
      
      // Only reset if enough time has passed (throttle)
      if (timeSinceLastReset >= THROTTLE_MS) {
        lastResetRef.current = now;
        resetTimer();
      }
    };

    // Listen for backend session expiration events
    const handleBackendSessionExpired = () => {
      handleTimeout();
    };

    // Initialize timer
    resetTimer();

    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    window.addEventListener('session-expired', handleBackendSessionExpired);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('session-expired', handleBackendSessionExpired);
    };
  }, [enabled, isSignedIn, timeout, signOut]); // Only these dependencies

  /**
   * Get remaining time until timeout
   */
  const getRemainingTime = useCallback(() => {
    if (!enabled || !isSignedIn) return null;
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = Math.max(0, timeout - elapsed);
    return remaining;
  }, [enabled, isSignedIn, timeout]);

  /**
   * Manually extend the session
   */
  const extendSession = useCallback(() => {
    lastResetRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        if (isTimeoutHandledRef.current) return;
        isTimeoutHandledRef.current = true;
        setShowExpiredModal(true);
        if (onTimeoutRef.current) onTimeoutRef.current();
        setTimeout(async () => {
          try {
            await signOut();
            window.location.href = '/';
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            window.location.href = '/';
          }
        }, 2000);
      }, timeout);
    }
  }, [timeout, signOut]);

  return {
    getRemainingTime,
    extendSession,
    lastActivity: lastActivityRef.current,
    showExpiredModal,
  };
};
