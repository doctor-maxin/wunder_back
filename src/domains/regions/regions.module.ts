import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RepositoriesModule } from '../../repositories.module';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';

@Module({
  imports: [JwtModule, RepositoriesModule],
  providers: [RegionsService],
  controllers: [RegionsController],
  exports: [RegionsService],
})
export class RegionsModule {}
