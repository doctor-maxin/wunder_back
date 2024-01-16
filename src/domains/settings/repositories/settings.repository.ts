import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Settings } from '@prisma/client';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import {
  ICustomerSettings,
  IRegionSettings,
} from '../../../common/interfaces/settings.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateCustomerSettingsDto } from '../dto/update-customer-settings.dto';
import { ContractEntityCreateDto } from '../../contracts/dto/contract-entity-create.dto';

@Injectable()
export class SettingsRepository {
  private readonly logger = new Logger(SettingsRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  public async addCustomerSettings(
    payload: CreateSettingsDto,
  ): Promise<ICustomerSettings> {
    return this.prisma.settings.create({
      data: {
        customer: { connect: { id: payload.customerId } },
        emailFrom: payload.emailFrom,
        ratesAdds: payload.ratesAdds,
        freeHours: payload.freeHours,
        freeTimes: payload.freeTimes,
        hourCost: payload.hourCost,
        vat: payload.vat,
        payType: payload.payType,
        allowTransfer: payload.allowTransfer,
        planFixManagerId: payload.planFixManagerId,
        paymentWaitingHours: payload.paymentWaitingHours,
        projectId: payload.projectId,
        financialManagerId: payload.financialManagerId,
      },
    });
  }

  public async findOne(
    where: Prisma.SettingsWhereInput,
  ): Promise<ICustomerSettings> {
    return this.prisma.settings.findFirst({ where });
  }

  public async bindSettingsToCustomer(
    id: number,
    contractId: number,
    customerId: number,
  ): Promise<ICustomerSettings> {
    return this.prisma.settings.update({
      where: { id },
      data: {
        customer: {
          connect: {
            id: customerId,
          },
        },
        contractId,
      },
    });
  }

  public async updateCustomerSettings(
    contractId: number,
    data: UpdateCustomerSettingsDto,
  ): Promise<ICustomerSettings> {
    return this.prisma.settings.update({
      where: {
        contractId,
      },
      data: {
        allowTransfer: data.allowTransfer,
        balanceUpdateDelay: data.balanceUpdateDelay,
        contractId: contractId,
        freeHours: data.freeHours,
        freeTimes: data.freeTimes,
        hourCost: data.hourCost,
        isEDNActive: data.isEDNActive,
        payType: data.payType,
        paymentWaitingHours: data.paymentWaitingHours,
        projectId: data.projectId,
        vat: data.vat,
      },
    });
  }

  public async createCustomerSettings(
    data: ContractEntityCreateDto['settings'],
  ): Promise<ICustomerSettings> {
    const settings = await this.globalSettings();

    return this.prisma.settings.create({
      data: {
        allowTransfer: data.allowTransfer
          ? data.allowTransfer
          : settings.allowTransfer,
        balanceUpdateDelay: data.balanceUpdateDelay
          ? data.balanceUpdateDelay
          : settings.balanceUpdateDelay,
        freeHours: data.freeHours ? data.freeHours : settings.freeHours,
        freeTimes: data.freeTimes ? data.freeTimes : settings.freeTimes,
        global: false,
        hourCost: data.hourCost ? data.hourCost : settings.hourCost,
        isEDNActive:
          'isEDNActive' in data ? data.isEDNActive : settings.isEDNActive,
        paymentWaitingHours: data.paymentWaitingHours
          ? data.paymentWaitingHours
          : settings.paymentWaitingHours,
        payType: data.payType ? data.payType : settings.payType,
        projectId: data.projectId ? data.projectId : settings.projectId,
        ratesAdds: data.ratesAdds ? data.ratesAdds : settings.ratesAdds,
        vat: data.vat ? data.vat : settings.vat,
      },
    });
  }

  public async globalSettings(regionId?: number): Promise<IRegionSettings> {
    let regionIdentification = regionId;

    if (!regionId) {
      const region = await this.prisma.region.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      this.logger.debug(region);
      regionIdentification = region.id;
    }
    return this.prisma.settings.findFirst({
      where: { regionId: regionIdentification },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            currency: true,
            sign: true,
          },
        },
      },
    });
  }

  public async findById(id: number): Promise<ICustomerSettings> {
    return this.prisma.settings.findUnique({
      where: { id },
    });
  }

  async settings(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.SettingsWhereUniqueInput;
    where?: Prisma.SettingsWhereInput;
    orderBy?: Prisma.SettingsOrderByWithRelationInput;
    include?: Prisma.SettingsInclude;
  }): Promise<Settings[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.settings.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async create(params: { data: CreateSettingsDto }): Promise<Settings> {
    const { data } = params;
    return this.prisma.settings.create({
      data,
    });
  }

  async createEmpty(regionId: number): Promise<IRegionSettings> {
    return this.prisma.settings.create({
      data: {
        emailFrom: 'Platform Wunder',
        projectId: parseInt(process.env.PROJECT_ID),
        region: {
          connect: {
            id: regionId,
          },
        },
      },
    });
  }

  async update(params: {
    data: {
      freeHours: number;
      freeTimes: number;
      payType: 'EXPENSES' | 'PREPAY' | 'POSTPAY';
      vat: number;
      allowTransfer: boolean;
      hourCost: number;
      ratesAdds: number;
    };
    where: { id: number };
  }): Promise<Settings> {
    const { data, where } = params;
    return this.prisma.settings.update({
      where,
      data,
    });
  }

  async delete(where: Prisma.SettingsWhereUniqueInput): Promise<Settings> {
    return this.prisma.settings.delete({ where });
  }
}
