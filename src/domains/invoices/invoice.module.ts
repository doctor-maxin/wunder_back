import { forwardRef, Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PlanFixModule } from '../../integrations/planfix/planfix.module';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [RepositoriesModule, forwardRef(() => PlanFixModule)],
  providers: [InvoiceService],
  exports: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
