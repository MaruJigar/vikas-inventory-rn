import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const socketClient: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export const SOCKET_EVENTS = {
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_READ: 'notification_read',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  BACKORDER_CREATED: 'backorder_created',
  BACKORDER_ALLOCATED: 'backorder_allocated',
} as const;
