import { ITask } from '../../../common/interfaces/task.interface';

export class WaitingTaskEntity {
  id: number;
  taskId: number;
  task: ITask;
  expireDate: Date;
  isActive: boolean;
}
