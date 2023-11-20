import {
  ICustomerSettings,
  ICustomerSystemSettings,
  ISystem,
} from './settings.interface';
import { ICustomer } from './user.interface';
import { ContractType } from '@prisma/client';

export interface IAccount {
  id: number;
  customerId: number;
  systemId: number;
  contractId: number;
  balance: number;
  isActive: boolean;
  login?: string;
  password?: string;
  email?: string;
  accountName: string;
  site: string;

  externalAccountId?: string;
  externalClientId?: string;
  externalAgency?: string;
  externalRegion?: string;

  customer: ICustomer;
  system: ISystem;
  contract: IContract;
}

export interface IContract {
  id: number;
  customerId: number;
  contractNumber?: string;
  contractService?: string;
  contractType: ContractType;
  isActive: boolean;
  customer?: ICustomer;
  settingsId: number;
  settings: ICustomerSettings;
  documents?: IDocument[];
  systemSettings: ICustomerSystemSettings[];
  expireDate?: Date;
  startDate: Date;
}

export interface IDocument {
  id: number;
  contractId: number;
  name?: string;
  comment?: string;
  link: string;
  contract?: IContract;
}
