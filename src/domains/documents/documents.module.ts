import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  controllers: [DocumentsController],
  imports: [RepositoriesModule],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
