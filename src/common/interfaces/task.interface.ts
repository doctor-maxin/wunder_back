import { TaskType } from '../types/taskType.enum';
import { ICustomer } from './user.interface';
import { IAccount } from './account.interface';
import { InvoiceEntity } from '../../domains/invoices/entity/invoice.entity';

export interface ITask {
  id: number;
  type: TaskType;
  customerId: number;
  managerId: string;
  parentId?: number;
  invoiceId?: number;
  counterparty?: ICustomer;
  account?: IAccount;
  invoice?: InvoiceEntity;
  customerCandidateId?: number;
}
