import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CustomerToSystemSettings,
  Prisma,
  SystemSettings,
} from '@prisma/client';
import { CreateCustomerSystemSettingsDto } from '../dto/create-customer-system-settings.dto';
import { CreateSystemSettingsDto } from '../dto/create-system-settings.dto';
import { UpdateCustomerSystemSettingsDto } from '../dto/update-customer-system-settings.dto';
import { UpdateSystemSettingsDto } from '../dto/update-system-settings.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegionsRepository } from '../../regions/regions.repository';
import {
  ICustomerSystemSettings,
  IRegionSystemSettings,
} from '../../../common/interfaces/settings.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SystemSettingsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionRepository: RegionsRepository,
  ) {}

  public async deleteCustomerLine(id: number): Promise<void> {
    await this.prisma.sysemSettingsCustomerLine.delete({
      where: {
        id,
      },
    });
  }

  public async deleteLine(id: number): Promise<void> {
    await this.prisma.sysemSettingsLine.delete({
      where: {
        id,
      },
    });
  }

  public async getCustomerSystemSettings(
    contractId: number,
  ): Promise<ICustomerSystemSettings[]> {
    return this.prisma.customerToSystemSettings.findMany({
      where: {
        contractId,
      },
      include: {
        lines: true,
      },
    });
  }
  public async globalSystemSettings(
    regionId?: number,
  ): Promise<IRegionSystemSettings[]> {
    let regionIdentifier = regionId;
    if (!regionId) {
      regionIdentifier = (await this.regionRepository.activeRegion()).id;
    }
    const settings = await this.prisma.systemSettings.findMany({
      where: { regionId: regionId },
      include: { lines: true, system: true, region: true },
    });

    return settings;
  }

  public async addCustomerSystemSettings(
    payload: Pick<
      ICustomerSystemSettings,
      'systemName' | 'customerId' | 'minSum' | 'isActive'
    >,
  ): Promise<ICustomerSystemSettings> {
    return this.prisma.customerToSystemSettings.create({
      data: {
        system: { connect: { name: payload.systemName } },
        customer: { connect: { id: payload.customerId } },
        minSum: payload.minSum,
        isActive: payload.isActive,
      },
      include: {
        lines: true,
      },
    });
  }

  public async updateCustomerSystemSettings(
    contractId: number,
    systemSettings: ICustomerSystemSettings[],
  ): Promise<ICustomerSystemSettings[]> {
    return Promise.all(
      systemSettings.map((systemSetting) =>
        this.updateCustomerSystemSettingsPoint(systemSetting),
      ),
    );
  }

  public async createCustomerSystemSettings(
    contractId: number,
    customerId: number,
    systemSetting: ICustomerSystemSettings[],
  ): Promise<CustomerToSystemSettings[]> {
    const list = await Promise.all(
      systemSetting.map((item) =>
        this.prisma.customerToSystemSettings.create({
          data: {
            Contract: {
              connect: {
                id: contractId,
              },
            },
            customer: {
              connect: {
                id: customerId,
              },
            },
            system: {
              connect: {
                name: item.systemName,
              },
            },
            isActive: item.isActive,
            minSum: item.minSum,
          },
        }),
      ),
    );

    const listWithLines = await Promise.all(
      list.map(async (item) => {
        const linesData = systemSetting.find(
          (s) => s.systemName === item.systemName,
        ).lines;
        const lines = await this.prisma.sysemSettingsCustomerLine.createMany({
          data: linesData.map((l) => ({
            fromAmount: l.fromAmount,
            toAmount: l.toAmount,
            commission: l.commission,
            discount: l.discount,
            systemName: l.systemName,
            systemSettingsId: item.id,
          })),
        });
        return {
          ...item,
          lines,
        };
      }),
    );

    return list;
  }

  private async updateCustomerSystemSettingsPoint(
    systemSettings: ICustomerSystemSettings,
  ): Promise<ICustomerSystemSettings> {
    let updatedPoint = await this.prisma.customerToSystemSettings.update({
      where: {
        id: systemSettings.id,
      },
      data: {
        isActive: systemSettings.isActive,
        minSum: systemSettings.minSum,
      },
      include: {
        lines: true,
      },
    });
    if (systemSettings.lines) {
      await this.removeCustomerSystemSettingsLines(systemSettings.id);
      const lines = await this.createCustomerSystemSettingsLines(
        systemSettings.id,
        systemSettings.lines,
      );
      return {
        ...updatedPoint,
        lines,
      };
    }

    return updatedPoint;
  }

  private async createCustomerSystemSettingsLines(
    systemSettingsId: number,
    lines: ICustomerSystemSettings['lines'],
  ): Promise<ICustomerSystemSettings['lines']> {
    return this.prisma.$transaction(
      lines.map((line) =>
        this.prisma.sysemSettingsCustomerLine.create({
          data: {
            discount: line.discount,
            commission: line.commission,
            fromAmount: line.fromAmount,
            toAmount: line.toAmount,
            systemName: line.systemName,
            systemSettings: {
              connect: { id: systemSettingsId },
            },
          },
        }),
      ),
    );
  }

  private async removeCustomerSystemSettingsLines(
    systemSettingsId: number,
  ): Promise<void> {
    await this.prisma.sysemSettingsCustomerLine.deleteMany({
      where: { systemSettingsId },
    });
  }

  async systemSetting({
    where,
  }: {
    where: Prisma.SystemSettingsWhereUniqueInput;
  }): Promise<SystemSettings | null> {
    return this.prisma.systemSettings.findUnique({
      where,
    });
  }

  async customerSystemSetting({
    where,
  }: {
    where: Prisma.CustomerToSystemSettingsWhereUniqueInput;
  }): Promise<CustomerToSystemSettings | null> {
    return this.prisma.customerToSystemSettings.findUnique({ where });
  }

  async systemSettings(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.SystemSettingsWhereUniqueInput;
    where?: Prisma.SystemSettingsWhereInput;
    orderBy?: Prisma.SystemSettingsOrderByWithRelationInput;
    include?: Prisma.SystemSettingsInclude;
  }): Promise<SystemSettings[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.systemSettings.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async customerSystemSettings(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CustomerToSystemSettingsWhereUniqueInput;
    where?: Prisma.CustomerToSystemSettingsWhereInput;
    orderBy?: Prisma.CustomerToSystemSettingsOrderByWithRelationInput;
    include?: Prisma.CustomerToSystemSettingsInclude;
  }): Promise<CustomerToSystemSettings[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.customerToSystemSettings.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async create(params: {
    data: CreateSystemSettingsDto;
  }): Promise<SystemSettings> {
    const { data } = params;
    return this.prisma.systemSettings.create({
      data,
    });
  }

  async createEmpty(regionId: number, defaultCurrency?: string) {
    const systems = await this.prisma.system.findMany();
    const systemSettings = [];
    for (const system of systems) {
      const settings = await this.prisma.systemSettings.create({
        data: {
          system: { connect: { id: system.id } },
          region: { connect: { id: regionId } },
          currency: defaultCurrency ? defaultCurrency : 'BYN',
        },
      });
      systemSettings.push(settings);
    }
    return systemSettings;
  }

  async createForCustomer(params: {
    data: CreateCustomerSystemSettingsDto;
  }): Promise<CustomerToSystemSettings> {
    const { data } = params;
    return this.prisma.customerToSystemSettings.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.SystemSettingsWhereUniqueInput;
    data: UpdateSystemSettingsDto;
  }): Promise<SystemSettings> {
    const { data, where } = params;
    return this.prisma.systemSettings.update({
      where,
      data,
    });
  }

  async updateForCustomer(params: {
    where: Prisma.CustomerToSystemSettingsWhereUniqueInput;
    data: UpdateCustomerSystemSettingsDto;
  }): Promise<CustomerToSystemSettings> {
    const { data, where } = params;
    return this.prisma.customerToSystemSettings.update({
      where,
      data,
    });
  }

  async delete(
    where: Prisma.SystemSettingsWhereUniqueInput,
  ): Promise<SystemSettings> {
    return this.prisma.systemSettings.delete({ where });
  }

  async deleteForCustomer(
    where: Prisma.CustomerToSystemSettingsWhereUniqueInput,
  ): Promise<CustomerToSystemSettings> {
    return this.prisma.customerToSystemSettings.delete({ where });
  }
}
