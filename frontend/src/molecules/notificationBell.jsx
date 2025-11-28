/**
 * @fileoverview Static bell icon component
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Show all the notifications and is always visible to all the users
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mysqlUserId, setMysqlUserId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const { getToken } = useAuth();

  // Obtain MySQL user ID on mount
  useEffect(() => {
    fetchMysqlUserId();
  }, []);

  // Fetch MySQL user ID function
  const fetchMysqlUserId = async () => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.user && data.user.id) {
          setMysqlUserId(data.user.id);
        }
      }
    } catch (error) {
      return error;
    }
  };

  // Fetch notifications when user ID is available
  useEffect(() => {
    if (mysqlUserId) {
      loadNotifications();
    }
  }, [mysqlUserId]);

  // Reload notifications when dropdown opens
  useEffect(() => {
    if (isOpen && mysqlUserId) {
      loadNotifications();
    }
  }, [isOpen, mysqlUserId]);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  /**
   * Handle ESC key to close dropdown
   * @param {KeyboardEvent} event - Keyboard event
   * @return {void}
   */
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  /**
   * Load notifications from API
   * @returns {Promise<void>}
   */
  const loadNotifications = async () => {
    if (!mysqlUserId) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications?IDUsuario=${mysqlUserId}&esRevisada=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          setNotifications(formatNotifications(data.data));
        } else {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format notifications for display
   * @param {Array} notifs - Raw notifications array 
   * @returns {Array} Formatted notifications array
   */
  const formatNotifications = (notifs) => {
    if (!notifs || !Array.isArray(notifs)) return [];

    return notifs.map(notif => {
      const metadata = typeof notif.metadata === 'string'
        ? JSON.parse(notif.metadata)
        : notif.metadata || {};

      return {
        ...notif,
        metadata,
        iconBg: getPriorityIconBg(notif.prioridad || notif.priority),
        message: notif.mensaje || notif.message || 'Sin mensaje',
        details: metadata?.details || notif.details || '',
        subtext: metadata?.subtext || notif.subtext || '',
        notificationID: notif.IDnotificacion || notif.notificationID || `real-${Date.now()}`,
      };
    });
  };

  /**
   * Get background color class for priority icon
   * @param {string} priority - Priority level
   * @returns {string} CSS class for background color
   */
  const getPriorityIconBg = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  /**
   * Mark notification as read
   * @param {*} notificationID - Notification ID
   * @returns {Promise<void>} 
   */
  const markAsRead = async (notificationID) => {
    try {
      const token = await getToken();

      const url = `${import.meta.env.VITE_API_URL}/notifications/${notificationID}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ esRevisada: 1 })
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.notificationID !== notificationID));
      } else {

      }
    } catch (error) {

    }
  };

  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.notificationID);

    if (notification.metadata?.redirectUrl) {
      navigate(notification.metadata.redirectUrl);
    } else {
      navigate('/perfil');
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.length;

  const MailIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );

  /**
   * Dropdown content component
   * @returns {JSX.Element}
   */
  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] max-h-[500px] flex flex-col"
      style={{
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-xl font-normal text-gray-900">
          Notificaciones
        </h3>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tienes notificaciones</p>
            <p className="text-sm text-gray-400 mt-1">Te avisaremos cuando haya algo nuevo</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <div
                key={notification.notificationID}
                onClick={() => handleNotificationClick(notification)}
                className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4 border-b border-gray-100 last:border-b-0"
              >
                {/* Icon */}
                <div className={`${notification.iconBg} rounded-lg p-2.5 flex-shrink-0`}>
                  <MailIcon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {notification.message}
                  </p>
                  {notification.details && (
                    <p className="text-xs text-gray-600 mb-0.5">
                      {notification.details}
                    </p>
                  )}
                  {notification.subtext && (
                    <p className="text-xs text-gray-500 italic">
                      {notification.subtext}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificaciones"
      >
        {/* Bell icon */}
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge with count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render dropdown using Portal */}
      {isOpen && createPortal(<DropdownContent />, document.body)}
    </>
  );
};

export default NotificationBell;