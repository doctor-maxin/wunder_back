import { CacheModule } from '@nestjs/cache-manager';
import { forwardRef, Module } from '@nestjs/common';
import { PlanFixController } from './planfix.controller';
import { PlanFixService } from './planfix.service';
import { PlanFixTransport } from './planfix.transport';
import { JwtModule } from '@nestjs/jwt';
import { RegionsModule } from '../../domains/regions/regions.module';
import { EmailModule } from '../../services/email/email.module';
import { UserModule } from '../../domains/users/user.module';
import { SettingsModule } from '../../domains/settings/settings.module';
import { TasksModule } from '../../services/tasks/tasks.module';
import { AuthModule } from '../../domains/auth/auth.module';
import { InvoiceModule } from '../../domains/invoices/invoice.module';
import { AccountsModule } from '../../domains/accounts/accounts.module';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60, // время жизни кэша в секундах
    }),
    RepositoriesModule,
    EmailModule,
    JwtModule,
    forwardRef(() => TasksModule),
    forwardRef(() => AuthModule),
    forwardRef(() => InvoiceModule),
  ],
  controllers: [PlanFixController],
  providers: [PlanFixTransport, PlanFixService],
  exports: [PlanFixService, PlanFixTransport],
})
export class PlanFixModule {}
