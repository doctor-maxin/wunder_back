import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { EdinModule } from '../../integrations/edin/edin.module';
import { AdvertisingModule } from '../../integrations/advertising/advertising.module';
import { AlfaBankModule } from '../../integrations/alfabank/payments.module';
import { RatesModule } from '../../domains/rates/rates.module';
import { PlanFixModule } from '../../integrations/planfix/planfix.module';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [
    RepositoriesModule,
    EdinModule,
    AdvertisingModule,
    RatesModule,
    AlfaBankModule,
    PlanFixModule,
  ],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
