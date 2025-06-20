import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('https://intervue-assignment-m134.onrender.com', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
});


    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setConnected(true);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  return { socket, connected };
};