import { Injectable } from '@nestjs/common';
import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerUpdateDto } from '../dto/customer-update.dto';
import {
  ICustomer,
  ICustomerGroup,
  IUser,
} from '../../../common/interfaces/user.interface';
import { CustomerFiltersDto } from '../dto/customer-filters.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById<T>(id: number, select?: Prisma.CustomerSelect) {
    return this.prisma.customer.findUnique({ where: { id }, select }) as T;
  }

  public async getCustomerGroup(id: number) {
    return this.prisma.customerGroup.findUnique({
      where: { id },
      include: {
        departments: true,
      },
    });
  }

  public async updateCustomer(
    id: number,
    payload: CustomerUpdateDto,
  ): Promise<ICustomer> {
    const data: CustomerUpdateDto = {};
    if (payload.companyAddress) data.companyAddress = payload.companyAddress;
    if (payload.companyName) data.companyName = payload.companyName;
    if (payload.companyEmail) data.companyEmail = payload.companyEmail;
    if (payload.companyPhoneNumber)
      data.companyPhoneNumber = payload.companyPhoneNumber;
    if (payload.companyTaxNumber)
      data.companyTaxNumber = payload.companyTaxNumber;
    if (payload.postalAddress) data.postalAddress = payload.postalAddress;

    if (payload.contactEmail) data.contactEmail = payload.contactEmail;
    if (payload.contactName) data.contactName = payload.contactName;
    if (payload.contactPhoneNumber)
      data.contactPhoneNumber = payload.contactPhoneNumber;
    if (payload.dateOfBirth) data.dateOfBirth = payload.dateOfBirth;

    if (payload.responsiblePersonPosition)
      data.responsiblePersonPosition = payload.responsiblePersonPosition;
    if (payload.responsiblePersonFullName)
      data.responsiblePersonFullName = payload.responsiblePersonFullName;
    if (payload.signatureDocumentType)
      data.signatureDocumentType = payload.signatureDocumentType;

    if (payload.bankAddress) data.bankAddress = payload.bankAddress;
    if (payload.bankName) data.bankName = payload.bankName;
    if (payload.accountNumber) data.accountNumber = payload.accountNumber;
    if (payload.BIC) data.BIC = payload.BIC;

    if (payload.isActive) data.isActive = payload.isActive;
    if (payload.isNew) data.isNew = payload.isNew;
    if (payload.planFixId) data.planFixId = payload.planFixId;

    return this.prisma.customer.update({
      where: {
        id,
      },
      data,
    });
  }

  public async deleteCustomer(id: number): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id } });
  }

  public async findUserById(id: number): Promise<IUser> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  public async findByUserId(userId: number): Promise<ICustomer> {
    return this.prisma.customer.findUnique({
      where: {
        userId,
      },
    });
  }

  public async setPassword(userId: number, secret: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        secret,
      },
    });
  }

  public async setCustomerActive(
    customerId: number,
    status: boolean,
  ): Promise<void> {
    await this.prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        isActive: status,
      },
    });
  }

  public async getList(params: CustomerFiltersDto): Promise<ICustomer[]> {
    return this.prisma.customer.findMany(params);
  }

  public async getCount(where: CustomerFiltersDto['where']): Promise<number> {
    return this.prisma.customer.count({ where });
  }

  public async getCustomer(id: number): Promise<ICustomer> {
    return this.prisma.customer.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  public async getCustomerGroupList(): Promise<ICustomerGroup[]> {
    return this.prisma.customerGroup.findMany({
      where: {
        isActive: true,
      },
    });
  }

  public async createCustomer(
    payload: CustomerCreateDto,
    userId: number,
  ): Promise<ICustomer> {
    return this.prisma.customer.create({
      data: {
        ...payload,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
