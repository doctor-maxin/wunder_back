import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RegionsModule } from './domains/regions/regions.module';
import { RepositoriesModule } from './repositories.module';
import { SettingsModule } from './domains/settings/settings.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { MomentModule } from '@ccmos/nestjs-moment';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './domains/auth/auth.module';
import { AccountsModule } from './domains/accounts/accounts.module';
import { ContractsModule } from './domains/contracts/contracts.module';
import { DocumentsModule } from './domains/documents/documents.module';
import { InvoiceModule } from './domains/invoices/invoice.module';
import { KnowledgeModule } from './domains/knowledebase/knowledge.module';
import { RatesModule } from './domains/rates/rates.module';
import { SystemModule } from './domains/systems/systems.module';
import { AdvertisingModule } from './integrations/advertising/advertising.module';
import { AlfaBankModule } from './integrations/alfabank/payments.module';
import { EdinModule } from './integrations/edin/edin.module';
import { PlanFixModule } from './integrations/planfix/planfix.module';
import { PdfModule } from './services/pdf-generation/pdf.module';
import { HelpersModule } from './helpers/helpers.module';
import { OneCModule } from './integrations/1c/1c.module';
import { AccumulativeDiscount } from './domains/accumulative-discount/accumulative-discount.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    PrismaModule,
    RepositoriesModule,
    RegionsModule,
    SettingsModule,
    CacheModule.register({
      ttl: 60 * 60, // время жизни кэша в секундах
    }),
    MomentModule.forRoot({
      tz: 'Europe/Minsk',
    }),
    EventEmitterModule.forRoot({
      maxListeners: 25,
    }),
    AuthModule,
    AccountsModule,
    ContractsModule,
    DocumentsModule,
    InvoiceModule,
    KnowledgeModule,
    RatesModule,
    SystemModule,
    AccumulativeDiscount,
    // Integrations
    AdvertisingModule,
    AlfaBankModule,
    EdinModule,
    PlanFixModule,
    PdfModule,
    HelpersModule,
    OneCModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CacheModule, AppService],
})
export class AppModule { }
