import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AlfabankService } from './alfabank.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [AlfabankService],
  exports: [AlfabankService],
})
export class AlfaBankModule {}
