'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketClient } from './socket-client';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketClient.connect();

      socketClient.on('connect', () => {
        setIsConnected(true);
      });

      socketClient.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        socketClient.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketClient, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
