import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ContractsService],
  exports: [ContractsService],
  controllers: [ContractsController],
})
export class ContractsModule {}
