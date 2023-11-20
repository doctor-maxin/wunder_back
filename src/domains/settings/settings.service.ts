import { Injectable, Logger } from '@nestjs/common';
import { RegionsRepository } from '../regions/regions.repository';
import { SettingsRepository } from './repositories/settings.repository';
import { SystemSettingsRepository } from './repositories/system-settings.repository';
import {
  ICustomerSettings,
  ICustomerSystemSettings,
  IRegionSettings,
  IRegionSystemSettings,
} from '../../common/interfaces/settings.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomerCompleteEvent } from '../../common/events/customer.events';
import { ContractsRepository } from '../contracts/contracts.repository';
import { ON_CUSTOMER_COMPLETE_SIGNUP } from '../../common/events/events';
import { IContract } from '../../common/interfaces/account.interface';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly systemSettingsRepository: SystemSettingsRepository,
    private readonly regionRepository: RegionsRepository,
    private readonly contractRepository: ContractsRepository,
  ) {}

  @OnEvent(ON_CUSTOMER_COMPLETE_SIGNUP)
  public async createEmptyCustomerSystemSettings(
    payload: CustomerCompleteEvent,
  ): Promise<void> {
    const regionSystemSettings =
      await this.systemSettingsRepository.globalSystemSettings();

    for (const systemSettings of regionSystemSettings) {
      await this.systemSettingsRepository.addCustomerSystemSettings({
        systemName: systemSettings.systemName,
        customerId: payload.customer.id,
        minSum: systemSettings.minSum,
        isActive: systemSettings.isActive,
      });
    }
  }

  @OnEvent(ON_CUSTOMER_COMPLETE_SIGNUP)
  public async createEmptyCustomerSettings(
    payload: CustomerCompleteEvent,
  ): Promise<ICustomerSettings> {
    return this.settingsRepository.addCustomerSettings({
      customerId: payload.customer.id,
      emailFrom: payload.regionSettings.emailFrom,
      ratesAdds: payload.regionSettings.ratesAdds,
      freeHours: payload.regionSettings.freeHours,
      freeTimes: payload.regionSettings.freeTimes,
      hourCost: Number(payload.regionSettings.hourCost),
      vat: payload.regionSettings.vat,
      payType: payload.regionSettings.payType,
      allowTransfer: payload.regionSettings.allowTransfer,
      planFixManagerId: payload.regionSettings.planFixManagerId,
      paymentWaitingHours: payload.regionSettings.paymentWaitingHours,
      projectId: payload.regionSettings.projectId,
      financialManagerId: payload.regionSettings.financialManagerId,
    });
  }

  public async getGlobalSettings(): Promise<IRegionSettings> {
    this.logger.debug('[getGlobalSettings]');
    return this.settingsRepository.globalSettings();
  }

  public async getGlobalSystemSettings(): Promise<IRegionSystemSettings[]> {
    const region = await this.regionRepository.activeRegion();

    return this.systemSettingsRepository.globalSystemSettings(region.id);
  }

  public async getCustomerSettings(customerId: number): Promise<{
    settings: ICustomerSettings;
    contract: Omit<IContract, 'settings' | 'systemSettings'>;
    systemSettings: ICustomerSystemSettings[];
  }> {
    const contract = await this.contractRepository.getCustomerActiveContract(
      customerId,
    );

    const settings = await this.settingsRepository.findById(
      contract.settingsId,
    );
    const systemSettings =
      await this.systemSettingsRepository.getCustomerSystemSettings(
        contract.id,
      );

    return {
      settings,
      contract,
      systemSettings,
    };
  }
}
