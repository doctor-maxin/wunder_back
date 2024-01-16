import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegionsRepository } from './regions.repository';
import { RegionWithSettings } from './entity/region-with-settings.entity';
import { RegionCreateDto } from './dto/region-create.dto';
import { RegionEntity } from './entity/region.entity';
import { RegionUpdateDto } from './dto/region-update.dto';
import { IRegion } from '../../common/interfaces/region.interface';
import { IRegionSystemSettings } from '../../common/interfaces/settings.interface';
import { ContactEntity } from './entity/contact.entity';
import {
  RegionSettingEntity,
  UpdateRegionSettings,
} from '../settings/entities/region-settings.entity';
import { SettingsRepository } from '../settings/repositories/settings.repository';
import { SystemSettingsRepository } from '../settings/repositories/system-settings.repository';
import { CreateComplaintDto } from '../../common/dtos/create-complaint.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ON_COMPLAINT } from '../../common/events/events';

@Injectable()
export class RegionsService {
  private systemSettingsRepository: SystemSettingsRepository;
  private readonly logger = new Logger(RegionsService.name)

  constructor(
    private prisma: PrismaService,
    public readonly regionRepository: RegionsRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly eventEmitter: EventEmitter2
  ) { }

  public async getRegionsWithSettings(): Promise<RegionWithSettings[]> {
    return this.regionRepository.regionWithSettings();
  }

  public async getRegions(): Promise<RegionEntity[]> {
    return this.regionRepository.regions();
  }

  public async createRegion(
    data: RegionCreateDto,
  ): Promise<RegionWithSettings> {
    const region = await this.regionRepository.create({
      name: data.name,
      isActive: data.isActive ? data.isActive : false,
      currency: data.defaultCurrency,
      sign: '',
    });

    const regionSettings = await this.settingsRepository.createEmpty(region.id);

    const systemSettings = await this.systemSettingsRepository.createEmpty(
      region.id,
      data.defaultCurrency,
    );

    const contacts = await this.regionRepository.createEmptyContact(region.id);

    if (data.isActive) {
      await this.regionRepository.disableAll(region.id);
    }

    return {
      ...region,
      contacts,
      settings: [regionSettings],
      systemSettings: systemSettings,
    };
  }

  public async deleteRegion(id: number): Promise<void> {
    if (isNaN(id)) throw new BadRequestException('Неверный формат id');
    const hasEntity = await this.prisma.region.findUnique({
      where: { id },
    });
    if (!hasEntity) throw new BadRequestException('Запись не найдена');
    await Promise.all([
      this.prisma.settings.deleteMany({
        where: {
          regionId: id,
        },
      }),
      this.prisma.systemSettings.deleteMany({
        where: {
          regionId: id,
        },
      }),
      this.prisma.region.delete({
        where: {
          id,
        },
      }),
    ]);
  }

  public async removeSettingsLine(id, isCustomer: boolean): Promise<void> {
    if (isNaN(id)) throw new BadRequestException('Невалидный id');
    if (isCustomer) {
      await this.prisma.sysemSettingsCustomerLine.delete({
        where: {
          id,
        },
      });
    } else
      await this.prisma.sysemSettingsLine.delete({
        where: {
          id,
        },
      });
  }

  private async updateRegionContacts(region: any): Promise<ContactEntity> {
    if (region.contacts && region.contacts.id) {
      return await this.prisma.contacts.update({
        where: { id: region.contacts.id },
        data: {
          contactName: region.contacts.contactName,
          BIC: region.contacts.BIC,
          bankName: region.contacts.bankName,
          accountNumber: region.contacts.accountNumber,
          companyAddress: region.contacts.companyAddress,
          companyTaxNumber: region.contacts.companyTaxNumber,
          companyName: region.contacts.companyName || '',
        },
      });
    } else {
      console.log('regionId', region.id);
      return await this.prisma.contacts.create({
        data: {
          ...region.contacts,
          region: {
            connect: { id: region.id },
          },
        },
      });
    }
  }

  private async updateRegionSystemSettings(
    systemSettings,
  ): Promise<IRegionSystemSettings[]> {
    const newSystems = [];
    for (const system of systemSettings) {
      if (system.lines) {
        const lines = system.lines.map((l) => ({
          ...l,
          systemSettingsId: system.id,
        }));
        system.lines = await this.prisma.$transaction(
          lines.map((line) => {
            return line.id
              ? this.prisma.sysemSettingsLine.update({
                where: {
                  id: line.id,
                },
                data: {
                  discount: line.discount || 0,
                  commission: line.commission || 0,
                  fromAmount: parseFloat(line.fromAmount),
                  toAmount: parseFloat(line.toAmount),
                },
              })
              : this.prisma.sysemSettingsLine.create({
                data: {
                  ...line,
                  fromAmount: parseFloat(line.fromAmount || 0),
                  toAmount: parseFloat(line.toAmount || 0),
                  commission: parseInt(line.commission || 0),
                  discount: parseInt(line.discount || 0),
                },
              });
          }),
        );
      }

      const updatedSystemSetting = await this.prisma.systemSettings.update({
        where: {
          regionId_systemName: {
            regionId: system.regionId,
            systemName: system.systemName,
          },
        },
        data: {
          minSum: system.minSum,
          isActive: system.isActive,
          currency: system.currency,
        },
        include: {
          lines: true,
        },
      });
      newSystems.push(updatedSystemSetting);
    }
    return newSystems;
  }

  private async updateCustomerSystemSettings(
    systemSettings,
    customersIds,
  ): Promise<void> {
    // Для каждого системы настроек из глоабльных
    for (const system of systemSettings) {
      // если есть линии
      for (const customerId of customersIds) {
        await this.prisma.customerToSystemSettings.updateMany({
          where: {
            customerId: customerId,
            systemName: system.systemName,
          },
          data: {
            minSum: system.minSum,
            isActive: system.isActive,
          },
        });
        if (system.lines.length) {
          const customerToSystemSettings =
            await this.prisma.customerToSystemSettings.findMany({
              where: {
                customerId: customerId,
                systemName: system.systemName,
              },
            });
          for (const customerSettings of customerToSystemSettings) {
            await this.prisma.sysemSettingsCustomerLine.deleteMany({
              where: {
                systemSettingsId: customerSettings.id,
              },
            });
            const lines = system.lines.map((l) => ({
              discount: l.discount,
              commission: l.commission,
              toAmount: l.toAmount,
              fromAmount: l.fromAmount,
              systemSettingsId: customerSettings.id,
              systemName: system.systemName,
            }));
            const newLines =
              await this.prisma.sysemSettingsCustomerLine.createMany({
                data: lines,
              });
            console.log('New Lines ', newLines);
          }
        }
        console.log(system.lines);
      }
    }
  }

  public async createComplaint(data: CreateComplaintDto) {
    const settings = await this.settingsRepository.globalSettings()
    this.logger.log('Отправка жалобы с темой: ' + data.theme)

    this.eventEmitter.emitAsync(ON_COMPLAINT, {
      content: data.content,
      subject: data.theme,
      to: settings.complaintEmail
    })
  }

  private async updateRegionSettings(
    settings: Omit<RegionSettingEntity, 'contractId' | 'regionId'>,
    settingsId: number,
  ): Promise<RegionSettingEntity> {
    console.log(settings.complaintEmail)
    return (await this.prisma.settings.update({
      where: { id: settingsId },
      data: {
        emailFrom: settings.emailFrom,
        ratesAdds: settings.ratesAdds,
        freeHours: settings.freeHours,
        freeTimes: settings.freeTimes,
        hourCost: settings.hourCost,
        vat: settings.vat,
        payType: settings.payType,
        allowTransfer: settings.allowTransfer,
        planFixManagerId: settings.planFixManagerId,
        paymentWaitingHours: settings.paymentWaitingHours,
        projectId: settings.projectId,
        financialManagerId: settings.financialManagerId,
        telegramLink: settings.telegramLink,
        whatappPhone: settings.whatappPhone,
        whatappText: settings.whatappText,
        telPhone: settings.telPhone,
        complaintEmail: settings.complaintEmail,
        complaintForm: settings.complaintForm
      },
    })) as unknown as RegionSettingEntity;
  }

  public async updateSettings(
    region: UpdateRegionSettings,
  ): Promise<RegionUpdateDto> {
    const result: RegionUpdateDto = {};
    //for (let regionName in data) {
    // const region = data[regionName] as UpdateRegionSettings;
    const regionName = region.name;

    const regionData = await this.updateRegionData(regionName, region);

    const settings = Array.isArray(region.settings)
      ? region.settings[0]
      : region.settings;

    const contacts = await this.updateRegionContacts(region);
    const updatedSettings = await this.updateRegionSettings(
      settings,
      settings.id,
    );

    const systemSettings = await this.updateRegionSystemSettings(
      region.systemSettings,
    );

    console.log(regionData);
    const result2: RegionUpdateDto = {
      ...result,
      ...regionData,
      settings: [updatedSettings],
      contacts: contacts,
    };
    console.log(result2);

    this.updateCustomerSettings(region);
    //}

    return result;
  }

  private async updateCustomerSettings(
    region: UpdateRegionSettings,
  ): Promise<void> {
    if (region.updateAllClients || region.updatePublicContractClients) {
      const customersIds = [];
      const settingsIds = [];
      const settings = region.settings;

      let customers = await this.prisma.customer.findMany({
        select: { id: true, settings: true, contracts: true },
      });

      if (region.updatePublicContractClients) {
        customers = customers.filter((c) => {
          if (c && c.contracts.length) {
            if (
              c.contracts.find(
                (contract) => contract.contractType === 'STANDARD',
              )
            )
              return c;
          }
          return false;
        });
      }

      customers.forEach((customer) => {
        customersIds.push(customer.id);
        for (const settings of customer.settings) {
          settingsIds.push(settings.id);
        }
      });

      await this.prisma.settings.updateMany({
        where: { id: { in: settingsIds } },
        data: {
          emailFrom: settings.emailFrom,
          ratesAdds: settings.ratesAdds,
          freeHours: settings.freeHours,
          freeTimes: settings.freeTimes,
          hourCost: settings.hourCost,
          vat: settings.vat,
          payType: settings.payType,
          allowTransfer: settings.allowTransfer,
          planFixManagerId: settings.planFixManagerId,
          paymentWaitingHours: settings.paymentWaitingHours,
          projectId: settings.projectId,
          financialManagerId: settings.financialManagerId,
        },
      });

      await this.updateCustomerSystemSettings(
        region.systemSettings,
        customersIds,
      );
    }
  }

  private async updateRegionData(
    regionName: string,
    region: Pick<IRegion, any>,
  ): Promise<IRegion> {
    return this.prisma.region.update({
      where: { name: regionName },
      data: {
        name: region.name,
        isActive: region.isActive,
        currency: region.currency,
      },
    });
  }
}
