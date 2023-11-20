import { IContract } from '../../../common/interfaces/account.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { ContractType } from '@prisma/client';
import { ICustomer } from '../../../common/interfaces/user.interface';
import {
  ICustomerSettings,
  ICustomerSystemSettings,
} from '../../../common/interfaces/settings.interface';
import { CustomerSettingsEntity } from '../../settings/entities/customer-settings.entity';
import { CustomerSystemSettingsEntity } from '../../settings/entities/customer-system-settings.entity';
import { DocumentEntity } from '../../documents/entity/document.entity';

export class ContractEntity implements IContract {
  @ApiPropertyOptional({ title: 'Номер договора' })
  @IsString()
  contractNumber?: string;

  @ApiPropertyOptional({ title: 'Наименование услуги' })
  @IsString()
  contractService?: string;

  @ApiProperty({ title: 'Номер договора', enum: ContractType })
  @IsString()
  contractType: ContractType;

  @ApiPropertyOptional({ title: 'Клиент' })
  @IsObject()
  customer?: ICustomer;

  @ApiProperty({ title: 'Идентификатор клиента' })
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ title: 'Дата окончания контракта' })
  @IsDateString()
  expireDate?: Date;

  @ApiProperty({ title: 'Идентификатор' })
  @IsNumber()
  id: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ type: CustomerSettingsEntity })
  @IsObject()
  settings: ICustomerSettings;

  @ApiProperty({ title: 'Идентификатор настроек' })
  @IsNumber()
  settingsId: number;

  @ApiProperty({ title: 'Дата начала контракта' })
  @IsDateString()
  startDate: Date;

  @ApiPropertyOptional({
    type: [CustomerSystemSettingsEntity],
    title: 'Правила систем',
  })
  systemSettings: ICustomerSystemSettings[];

  @ApiPropertyOptional({ type: DocumentEntity, title: 'Список документов' })
  documents?: DocumentEntity[];
}
