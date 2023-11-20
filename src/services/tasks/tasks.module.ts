import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { RepositoriesModule } from '../../repositories.module';
import { PlanFixModule } from '../../integrations/planfix/planfix.module';

@Module({
  imports: [RepositoriesModule, forwardRef(() => PlanFixModule)],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
