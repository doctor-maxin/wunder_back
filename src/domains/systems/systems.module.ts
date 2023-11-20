import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { RepositoriesModule } from '../../repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [SystemController],
  providers: [],
  exports: [],
})
export class SystemModule {}
