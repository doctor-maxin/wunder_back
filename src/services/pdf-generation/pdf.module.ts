import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { SettingsModule } from '../../domains/settings/settings.module';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [RepositoriesModule, SettingsModule],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
