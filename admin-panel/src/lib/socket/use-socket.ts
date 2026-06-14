'use client';

import { useEffect } from 'react';
import { useSocketContext } from './socket-provider';

export function useSocketEvent(event: string, callback: (data: unknown) => void) {
  const { socket, isConnected } = useSocketContext();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, isConnected, event, callback]);
}
