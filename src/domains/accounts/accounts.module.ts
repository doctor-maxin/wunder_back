import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../../repositories.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './services/accounts.service';
import { AccountsTopUpService } from './services/accounts-topup.service';
import { PlanFixModule } from '../../integrations/planfix/planfix.module';
import { TasksModule } from '../../services/tasks/tasks.module';
import { EmailModule } from '../../services/email/email.module';
import { AdvertisingModule } from '../../integrations/advertising/advertising.module';
import { InvoiceModule } from '../invoices/invoice.module';

@Module({
  imports: [
    RepositoriesModule,
    PlanFixModule,
    TasksModule,
    EmailModule,
    AdvertisingModule,
    InvoiceModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsTopUpService],
  exports: [AccountsService, AccountsTopUpService],
})
export class AccountsModule {}
