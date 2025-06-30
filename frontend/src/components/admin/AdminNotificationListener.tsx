import React, { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../utils/apiConfig';

const AdminNotificationListener: React.FC = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastOrderNotifIdRef = useRef<string | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/orderNotification.wav');
    audioRef.current.preload = 'auto';

    const connectSSE = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new SSE connection
        const eventSource = new EventSource(`${API_BASE_URL}/notifications/sse`, {
          withCredentials: true
        });

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'order' && data._id !== lastOrderNotifIdRef.current) {
            audioRef.current?.play().catch(() => {});
            lastOrderNotifIdRef.current = data._id;
          }
        };

        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error('Error connecting to SSE:', error);
        setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/orderNotification.wav" preload="auto" />
    </>
  );
};

export default AdminNotificationListener; 