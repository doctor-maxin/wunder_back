import { IRegionSettings } from '../interfaces/settings.interface';
import { ICustomer } from '../interfaces/user.interface';

export class CustomerCompleteEvent {
  customer: ICustomer;
  regionSettings: IRegionSettings;
  customerCandidateId: number;
  taskId?: number;

  constructor(
    customer: ICustomer,
    regionSettings: IRegionSettings,
    customerCandidateId: number,
    taskId?: number,
  ) {
    this.customer = customer;
    this.regionSettings = regionSettings;
    this.customerCandidateId = customerCandidateId;
    this.taskId = taskId;
  }
}
