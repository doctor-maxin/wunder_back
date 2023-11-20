import { Injectable } from '@nestjs/common';
import { ContractType } from '@prisma/client';
import { ContractsListDto } from './dto/contracts-list.dto';
import { ContractsSearchDto } from './dto/contracts-search.dto';
import { ContractsRepository } from './contracts.repository';
import { ContractEntity } from './entity/contract.entity';
import { SystemSettingsRepository } from '../settings/repositories/system-settings.repository';
import { DocumentRepository } from '../documents/document.repository';
import { SettingsRepository } from '../settings/repositories/settings.repository';
import { ContractEntityUpdateDto } from './dto/contract-entity-update.dto';
import { ContractEntityCreateDto } from './dto/contract-entity-create.dto';
import { IContract } from '../../common/interfaces/account.interface';
import { Prisma } from '.prisma/client';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractRepository: ContractsRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly systemSettingsRepository: SystemSettingsRepository,
    private readonly documentRepository: DocumentRepository,
  ) {}

  public async getList(
    customerId: number,
    limit: number,
    skip: number,
    query?: string,
    fromDate?: string,
    endDate?: string,
    contractId?: string,
  ): Promise<ContractsListDto> {
    const params = this.getListFilters(
      customerId,
      query,
      fromDate,
      endDate,
      contractId,
    );

    const [count, array] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.contractRepository.getCount(params),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.contractRepository.getContracts(limit, skip, params),
    ]);
    return { count, array };
  }

  public async deleteContract(contractId: number): Promise<void> {
    await this.contractRepository.deleteContract(contractId);
  }

  public async getContract(id: number): Promise<IContract> {
    return this.contractRepository.getContract(id);
  }
  public async updateContract(
    contractId: number,
    data: ContractEntityUpdateDto,
  ): Promise<ContractEntity> {
    const documents =
      data.documents && Array.isArray(data.documents)
        ? await this.documentRepository.upsertDocuments(
            contractId,
            data.documents,
          )
        : [];
    const settings = await this.settingsRepository.updateCustomerSettings(
      contractId,
      data.settings,
    );
    const systemSettings =
      await this.systemSettingsRepository.updateCustomerSystemSettings(
        contractId,
        data.systemSettings,
      );
    const contract = await this.contractRepository.updateContract(
      contractId,
      data,
    );

    return {
      ...contract,
      documents,
      settings,
      systemSettings,
    };
  }

  private getListFilters(
    customerId: number,
    query?: string,
    fromDate?: string,
    endDate?: string,
    contractId?: string,
  ): ContractsSearchDto {
    const params: any = {};

    if (customerId) {
      params['customerId'] = customerId;
    }

    if (query) {
      params['OR'] = [{ contractService: { contains: query } }];
      if ('Действующий'.search(query) !== -1) {
        params['OR'].push({
          isActive: { equals: true },
        });
      }
      if ('Уникальный'.search(query) !== -1) {
        params['OR'].push({
          contractType: { equals: ContractType.CUSTOM },
        });
      }
      if ('Публичный'.search(query) !== -1) {
        params['OR'].push({
          contractType: { equals: ContractType.STANDARD },
        });
      }
      if ('Предоплата'.search(query) !== -1) {
        params['OR'].push({
          settings: { prepay: { equals: true } },
        });
      }
      if ('Приостановлен'.search(query) !== -1) {
        params['OR'].push({
          isActive: { equals: false },
        });
      }
    }
    if (contractId) {
      params['id'] = Number(contractId);
    }
    if (fromDate && endDate) {
      const [d, m, y] = endDate.split('-');
      const [d1, m1, y1] = fromDate.split('-');
      const end = new Date(Number(y), Number(m) - 1, Number(d));
      const from = new Date(Number(y1), Number(m1) - 1, Number(d1));

      if (params['OR']) {
        params['OR'].push({
          startDate: { gte: from },
        });
        params['OR'].push({
          expireDate: { lte: end },
        });
      } else
        params['OR'] = [
          { startDate: { gte: from } },
          { expireDate: { lte: end } },
        ];
    } else if (fromDate) {
      const [d1, m1, y1] = fromDate.split('-');
      const from = new Date(Number(y1), Number(m1) - 1, Number(d1));
      params['startDate'] = {
        gte: from,
      };
    } else if (endDate) {
      const [d, m, y] = fromDate.split('-');
      const end = new Date(Number(y), Number(m) - 1, Number(d));
      params['expireDate'] = {
        lte: end,
      };
    }

    return params satisfies Prisma.ContractWhereInput;
  }

  public async deleteCustomerSystemLine(id: number): Promise<void> {
    await this.systemSettingsRepository.deleteCustomerLine(id);
  }

  public async deleteSystemLine(id: number): Promise<void> {
    await this.systemSettingsRepository.deleteLine(id);
  }

  public async createContract(
    data: ContractEntityCreateDto,
  ): Promise<IContract> {
    let settings = await this.settingsRepository.createCustomerSettings(
      data.settings,
    );
    const systemSettings = {
      list: [],
    };

    const contract = await this.contractRepository.createContract(
      settings.id,
      data,
    );

    settings = await this.settingsRepository.bindSettingsToCustomer(
      settings.id,
      contract.id,
      data.customerId,
    );

    if (contract.contractType === ContractType.CUSTOM) {
      systemSettings.list =
        await this.systemSettingsRepository.createCustomerSystemSettings(
          contract.id,
          data.customerId,
          data.systemSettings,
        );
    }

    const documents = await this.documentRepository.upsertDocuments(
      contract.id,
      data.documents,
    );

    return {
      ...contract,
      documents,
      settings,
      systemSettings: systemSettings.list,
    };
  }
}
