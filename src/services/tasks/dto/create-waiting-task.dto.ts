export class CreateWaitingTaskDto {
  paymentWaitingHours: number;
  id: number;
  invoiceId: number;
  customerId: number;
  managerId: string;
  parentId?: number;
}
