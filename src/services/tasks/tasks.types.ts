import { TaskType } from '../../common/types/taskType.enum';

export type TaskPayload = {
  id: number;
  type: TaskType;
  customerId?: number;
  managerId: string;
  parentId?: number;
  invoiceId?: number;
  customerCandidateId?: number;
  accountId?: number;
};
