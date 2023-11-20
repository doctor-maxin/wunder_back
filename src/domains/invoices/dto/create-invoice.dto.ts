import { TopUpAccountLine } from '../../accounts/dto/top-up-account.dto';
import {
  ICustomerSystemSettings,
  IRegionSystemSettings,
} from '../../../common/interfaces/settings.interface';

export class CreateInvoiceDto {
  lines: TopUpAccountLine[];
  customerId: number;
  currency: string;
  contractId: number;
  systemSettings: ICustomerSystemSettings[] | IRegionSystemSettings[];
}
