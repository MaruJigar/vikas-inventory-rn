import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { appConfig } from '../config/app.config';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Dynamic origin resolution matching REST API
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        process.env.ADMIN_PANEL_URL,
        process.env.REACT_NATIVE_WEB_URL,
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
export class AppSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers['authorization'];
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      client.data.user = payload;

      // Assign to role-based room
      client.join(`${payload.role}:${payload.sub}`);
      console.log(
        'Socket authenticated and joined room:',
        `${payload.role}:${payload.sub}`,
      );
    } catch (err) {
      console.log('Socket connection rejected:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  broadcastToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }
}
