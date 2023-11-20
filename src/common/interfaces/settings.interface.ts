import { IRegion } from './region.interface';
import { ICustomer } from './user.interface';
import { IContract } from './account.interface';
import { PayType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IRegionSettings extends ISettings {
  emailFrom: string;
  planFixManagerId: string;
  financialManagerId: string;
  telegramLink?: string;
  whatappText?: string;
  whatappPhone?: string;
  telPhone?: string;
  regionId: number;
  region?: Pick<IRegion, 'id' | 'name' | 'sign'>;
  paymentWaitingHours: number;
  balanceUpdateDelay: number;
}

export interface ICustomerSettings extends ISettings {
  contractId: number;
  contract?: IContract;
  customerId: number;
  customer?: ICustomer;
}

export interface ISettings {
  id: number;
  ratesAdds: number;
  freeHours: number;
  freeTimes: number;
  contractId: number;
  hourCost: number | Decimal;
  vat: number;
  payType: PayType;
  allowTransfer: boolean;
  projectId: number;
  isEDNActive: boolean;
}

export interface ISystemSettings {
  id: number;
  lines: ISystemSettingsLine[];
  systemName: string;
  minSum: number | Decimal;
  system?: ISystem;
  isActive: boolean;
}

export interface IRegionSystemSettings extends ISystemSettings {
  regionId: number;
  currency: string;
  region?: IRegion;
}

export interface ICustomerSystemSettings extends ISystemSettings {
  customerId?: number;
  customer?: ICustomer;
  contractId?: number;
  contract?: IContract;
}

export interface ISystem {
  id: number;
  name: string;
}

export interface ISystemSettingsLine {
  id: number;
  discount: number;
  systemSettingsId: number;
  systemSettings?: IRegionSystemSettings;
  commission: number;
  fromAmount: number | Decimal;
  toAmount: number | Decimal;
  systemName: string;
}

export interface ISystem {
  id: number;
  name: string;
}
