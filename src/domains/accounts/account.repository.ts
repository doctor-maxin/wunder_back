import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountEntity } from './entities/account.entity';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getList(): Promise<AccountEntity[]> {
    return this.prisma.account.findMany({
      include: {
        system: true,
      },
    });
  }

  public async bindTaskId(id: number, taskId: number): Promise<void> {
    await this.prisma.account.update({
      where: { id },
      data: { taskId },
    });
  }

  public async getCustomerAccounts(
    customerId: number,
  ): Promise<AccountEntity[]> {
    return this.prisma.account.findMany({
      where: {
        customerId,
      },
      include: {
        system: true,
      },
    });
  }

  public async createAccount(
    data: CreateAccountDto,
    systemId: number,
  ): Promise<Omit<AccountEntity, 'system'>> {
    return this.prisma.account.create({
      data: {
        accountName: data.accountName,
        site: data.site,
        email: data.email,
        externalAccountId: '',
        externalClientId: '',
        externalRegion: '',
        externalAgency: '',
        login: '',
        password: '',
        contract: {
          connect: { id: data.contractId },
        },
        customer: {
          connect: { id: data.customerId },
        },
        system: { connect: { id: systemId } },
      },
    });
  }

  public async updateAccount(
    id: number,
    data: UpdateAccountDto,
  ): Promise<AccountEntity> {
    const payload: any = {};
    if (data.accountName) payload.accountName = data.accountName;
    if (data.balance) payload.balance = data.balance;
    if (data.email) payload.email = data.email;
    if (data.externalAccountId)
      payload.externalAccountId = data.externalAccountId;
    if (data.externalAgency) payload.externalAgency = data.externalAgency;
    if (data.externalClientId) payload.externalClientId = data.externalClientId;
    if (data.externalRegion) payload.externalRegion = data.externalRegion;
    if (data.isActive) payload.isActive = data.isActive;
    if (data.login) payload.login = data.login;
    if (data.password) payload.password = data.password;
    if (data.site) payload.site = data.site;

    return this.prisma.account.update({
      where: { id },
      data: payload,
      include: {
        system: true,
      },
    });
  }

  public async getAccount(id: number): Promise<AccountEntity> {
    return this.prisma.account.findUnique({
      where: { id },
      include: {
        system: true,
      },
    });
  }

  public async getAccountByTask(taskId: number): Promise<AccountEntity> {
    return this.prisma.account.findUnique({
      where: { taskId },
      include: {
        system: true,
      },
    });
  }

  public async setBalance(id: number, balance: number): Promise<void> {
    await this.prisma.account.update({
      where: { id },
      data: { balance },
    });
  }

  public async deleteAccount(id: number): Promise<void> {
    await this.prisma.account.delete({
      where: { id },
    });
  }
}
