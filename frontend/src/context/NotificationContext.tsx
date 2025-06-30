import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  message: string;
  type: 'system' | 'order' | 'payment' | 'message';
  read: boolean;
  createdAt: string;
  order?: string;
  messageRef?: {
    _id: string;
    name: string;
    email: string;
    message: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastOrderNotifIdRef = useRef<string | null>(null);
  const firstLoad = useRef(true);

  const fetchNotifications = async () => {
    if (firstLoad.current) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`, { withCredentials: true });
      const data = res.data;
      const newNotifications = (data.notifications || []).sort((a: Notification, b: Notification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      // Play sound for new order
      const latestNotif = newNotifications[0];
      if (
        latestNotif &&
        latestNotif.type === 'order' &&
        latestNotif._id !== lastOrderNotifIdRef.current
      ) {
        audioRef.current?.play().catch(() => {});
        lastOrderNotifIdRef.current = latestNotif._id;
      }
      setNotifications(newNotifications);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  useEffect(() => {
    audioRef.current = new Audio('/orderNotification.wav');
    audioRef.current.preload = 'auto';
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, loading, error, refetch: fetchNotifications }}>
      {children}
      <audio ref={audioRef} src="/orderNotification.wav" preload="auto" />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}; 