export class CreateCustomerSystemSettingsDto {
  customerId?: number;
  contractId?: number;
  systemName: string;
  isActive?: boolean;
  minSum?: number;
}
