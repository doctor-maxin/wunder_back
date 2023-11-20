import { Injectable } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../common/interfaces/websocket.interface';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
@WebSocketGateway({
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
  },
})
export class WebSocketClient {
  @WebSocketServer()
  server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();
  private readonly logger = new Logger('ChatGateway');

  //on connect
  handleConnection(socket: Socket) {}

  @SubscribeMessage('check-event')
  public async pingHandle(client: Socket, data: any): Promise<void> {
    console.log('PING');
    this.server.emit('pong');

    return data;
  }

  @SubscribeMessage('register')
  public async registerCustomer(client: Socket, data: any): Promise<void> {
    console.log('register', data);

    client.join(data.room + '');
    return data;
  }

  @OnEvent('check')
  public async pong(id: string = '1') {
    console.log('try pong');

    const r = await this.server.to(id).emit('check', 1);
    console.log(id);
    console.log(r, id);
  }
}
