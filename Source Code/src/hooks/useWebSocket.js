import { useEffect, useRef, useState, useCallback } from 'react';

// WebSocket hook for real-time features
const useWebSocket = (url = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState([]);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Default WebSocket URL
  const wsUrl = url || `ws://localhost:5002`;

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        setErrors([]);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'notification':
              setNotifications(prev => [data.payload, ...prev]);
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification(data.payload.title, {
                  body: data.payload.message,
                  icon: '/favicon.ico'
                });
              }
              break;

            case 'message':
              setMessages(prev => [...prev, data.payload]);
              break;

            case 'user_online':
            case 'user_offline':
              // Handle user presence
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrors(prev => [...prev, error]);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setErrors(prev => [...prev, error]);
    }
  }, [wsUrl]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'Client disconnect');
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
  }, []);

  const sendMessage = useCallback((type, payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const sendChatMessage = useCallback((roomId, message) => {
    sendMessage('chat', { roomId, message, timestamp: new Date().toISOString() });
  }, [sendMessage]);

  const joinRoom = useCallback((roomId) => {
    sendMessage('join_room', { roomId });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId) => {
    sendMessage('leave_room', { roomId });
  }, [sendMessage]);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    notifications,
    errors,
    sendMessage,
    sendChatMessage,
    joinRoom,
    leaveRoom,
    markNotificationAsRead,
    clearNotifications,
    requestNotificationPermission,
    reconnect: connect
  };
};

export default useWebSocket;
