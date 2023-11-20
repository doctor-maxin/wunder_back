import { Module } from '@nestjs/common';
import { RatesService } from './services/rates.service';
import { RatesController } from './rates.controller';
import { RatesGrabber } from './services/rates.grabber';
import { HttpModule } from '@nestjs/axios';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    RepositoriesModule,
  ],
  controllers: [RatesController],
  providers: [RatesService, RatesGrabber],
  exports: [RatesService],
})
export class RatesModule {}
