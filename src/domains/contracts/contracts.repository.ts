import { Injectable } from '@nestjs/common';
import { IContract } from '../../common/interfaces/account.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { ContractsUpdateDto } from './dto/contracts-update.dto';
import { ContractEntityCreateDto } from './dto/contract-entity-create.dto';
import { Prisma } from '.prisma/client';

@Injectable()
export class ContractsRepository {
  constructor(private readonly prisma: PrismaService) {}
  public async getCustomerContracts(
    customerId: number,
    includeSystemSettings?: boolean,
    includeSettings?: boolean,
  ): Promise<Omit<IContract, 'settings' | 'systemSettings' | 'customer'>[]> {
    return this.prisma.contract.findMany({
      where: {
        customerId,
      },
      include: {
        systemSettings: includeSystemSettings || false,
        settings: includeSettings || false,
      },
    });
  }

  public async getCustomerActiveContract(
    customerId: number,
  ): Promise<Omit<IContract, 'settings' | 'systemSettings'>> {
    return this.prisma.contract.findFirst({
      where: {
        customerId,
        isActive: true,
      },
    });
  }

  public async deleteContract(contractId: number): Promise<void> {
    await this.prisma.contract.delete({ where: { id: contractId } });
  }

  public async getCount(where: Prisma.ContractWhereInput): Promise<number> {
    return this.prisma.contract.count({ where: where });
  }

  public async getContract(id: number): Promise<IContract> {
    return this.prisma.contract.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        settings: true,
        documents: true,
        systemSettings: {
          include: {
            lines: true,
          },
        },
      },
    });
  }

  public async getContracts(
    take: number,
    skip: number,
    where: Prisma.ContractWhereInput,
  ): Promise<IContract[]> {
    return this.prisma.contract.findMany({
      skip,
      take,
      where,
      include: {
        settings: true,
        systemSettings: {
          include: {
            lines: true,
          },
        },
      },
    });
  }

  public async updateContract(
    id: number,
    data: ContractsUpdateDto,
  ): Promise<Omit<IContract, 'settings' | 'systemSettings'>> {
    return this.prisma.contract.update({
      where: { id },
      data: {
        contractType: data.contractType,
        contractService: data.contractService,
        contractNumber: data.contractNumber,
        startDate: data.startDate,
        expireDate: data.expireDate,
        isActive: data.isActive,
      },
    });
  }

  public async createContract(
    settingsId: number,
    data: ContractEntityCreateDto,
  ): Promise<Omit<IContract, 'settings' | 'systemSettings'>> {
    const payload: any = {
      customer: {
        connect: { id: data.customerId },
      },
      settings: {
        connect: {
          id: settingsId,
        },
      },
    };
    if (data.contractType) payload.contractType = data.contractType;
    if (data.contractService) payload.contractService = data.contractService;
    if (data.contractNumber) payload.contractNumber = data.contractNumber;
    if (data.startDate) payload.startDate = data.startDate;
    if (data.expireDate) payload.expireDate = data.expireDate;
    if ('isActive' in data) payload.isActive = data.isActive;

    return this.prisma.contract.create({
      data: payload,
    });
  }
}
