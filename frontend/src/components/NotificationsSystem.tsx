import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBell, FiCheck, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  message: string;
  type: 'order' | 'system' | 'alert' | 'message';
  createdAt: Date;
  read: boolean;
}

const NotificationsSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio and check permissions
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/notification.wav');
    audioRef.current.preload = 'auto';

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    // If permission was already granted, hide banner
    if (Notification.permission === 'granted') {
      setShowPermissionBanner(false);
    }

    // Set up periodic notification check
    const interval = setInterval(fetchNotifications, 15000); // Check every 15 seconds
    fetchNotifications(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      const data = await response.data;
      
      // Check for new unread notifications
      const newNotifications = data.filter(
        (n: Notification) => !notifications.some(existing => existing.id === n.id)
      );

      setNotifications(data);

      // Play sound and show alert for new notifications
      if (newNotifications.length > 0 && permission === 'granted') {
        playNotificationSound();
        showBrowserNotification(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio
      audioRef.current.play().catch(e => {
        console.error('Audio playback failed:', e);
      });
    }
  };

  // Show browser notification
  const showBrowserNotification = (newNotifications: Notification[]) => {
    if (permission !== 'granted') return;

    newNotifications.forEach(notif => {
      new Notification(`New ${notif.type} notification`, {
        body: notif.message,
        icon: '/logo.png',
      });
    });
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    Notification.requestPermission().then(perm => {
      setPermission(perm);
      if (perm === 'granted') {
        setShowPermissionBanner(false);
        // Test notification
        new Notification('Notifications enabled', {
          body: 'You will now receive alerts for new orders',
        });
      }
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifs =>
      notifs.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="notifications-container">
      {/* Permission banner */}
      {showPermissionBanner && (
        <div className="permission-banner">
          <div className="banner-content">
            <FiBell className="bell-icon" />
            <div>
              <h3>Enable Notifications</h3>
              <p>Get sound alerts for new orders and updates</p>
            </div>
          </div>
          <div className="banner-actions">
            <button 
              className="allow-btn"
              onClick={requestNotificationPermission}
            >
              Allow
            </button>
            <button 
              className="dismiss-btn"
              onClick={() => setShowPermissionBanner(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="notifications-list">
        <div className="list-header">
          <h2>Notifications</h2>
          <button 
            className="mark-all-read"
            onClick={() => setNotifications(notifs => 
              notifs.map(n => ({ ...n, read: true }))
            )}
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <FiBell className="empty-icon" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ul>
            {notifications.map(notif => (
              <li 
                key={notif.id} 
                className={`notification-item ${notif.read ? '' : 'unread'}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="notification-icon">
                  {notif.type === 'order' ? (
                    <FiShoppingBag />
                  ) : notif.type === 'message' ? (
                    <FiMessageSquare />
                  ) : (
                    <FiBell />
                  )}
                </div>
                <div className="notification-content">
                  <p className="message">{notif.message}</p>
                  <p className="time">{formatDate(notif.createdAt)}</p>
                </div>
                {!notif.read && <div className="unread-badge" />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
    </div>
  );
};

export default NotificationsSystem;