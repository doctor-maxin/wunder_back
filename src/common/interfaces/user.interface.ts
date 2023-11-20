import { Admin, Customer, RefreshToken, Role } from '@prisma/client';
import { IRegion } from './region.interface';
import { IContract } from './account.interface';

export interface IUser {
  id: number;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  secret: string;
  admin?: Admin;
  customer?: ICustomer;
  refreshToken?: RefreshToken;
  role: Role;
}

export interface IContact {
  id: number;
  contactName: string;
  BIC: string;
  bankName: string;
  accountNumber: string;
  companyAddress: string;
  companyTaxNumber: string;
  companyName: string;
  regionId: number;
  region?: IRegion;
}

export interface ICustomerCandidate {
  id: number;
  regionName?: string;
  companyName: string;
  companyTaxNumber: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactName: string;
  publicAgree: boolean;
  taskId?: number;
  customerId?: number;
}

export interface ICustomer extends ICustomerCandidate {
  userId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isNew: boolean;
  dateOfBirth?: Date;
  accountNumber: string;
  BIC: string;
  bankAddress: string;
  bankName: string;
  companyAddress: string;
  companyPhoneNumber: string;
  companyEmail: string;
  postalAddress: string;
  responsiblePersonFullName: string;
  responsiblePersonPosition: string;
  signatureDocumentType: string;
  personalAgree?: boolean;
  planFixId?: number;
  user?: IUser;
  groupId?: number;
  contracts?: IContract[];
}

export interface IUserCustomer extends IUser {
  customer: ICustomer;
}

export interface IAdmin {
  id: number;
  userId: number;
  name: string;
}

export interface ICustomerGroup {
  id: number;
  userId: number;
  isActive: boolean;
  companyName: string;
  companyEmail: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface IUserAdmin extends IUser {
  admin: IAdmin;
}
export interface IUserCustomerGroup extends IUser {
  group: ICustomerGroup;
}
