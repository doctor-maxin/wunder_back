import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { AdvertisingService } from './advertising.service';
import { AdvertisingController } from './advertising.controller';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [AdvertisingService],
  controllers: [AdvertisingController],
  exports: [AdvertisingService],
})
export class AdvertisingModule {}
