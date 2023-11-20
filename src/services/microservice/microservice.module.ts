import { Module } from '@nestjs/common';
import { WebSocketClient } from './websocket.client';

@Module({
  providers: [WebSocketClient],
  exports: [WebSocketClient],
})
export class MicroserviceModule {}
