import { Module } from '@nestjs/common';
import { EdinService } from './edin.service';
import { EdinController } from './edin.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
    }),
  ],
  providers: [EdinService],
  exports: [EdinService],
  controllers: [EdinController],
})
export class EdinModule {}
