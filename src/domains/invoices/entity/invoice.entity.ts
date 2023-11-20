import { InvoiceDocumentType, InvoiceStatus } from '@prisma/client';
import { IRegionSystemSettings } from '../../../common/interfaces/settings.interface';
import { InvoiceRatesEntity } from './invoice-rates.entity';
import { SystemName } from '../../systems/entity/system.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsCurrency,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';
import { CustomerSystemSettingsEntity } from '../../settings/entities/customer-system-settings.entity';

export class invoiceDocument implements IInvoiceDocument {
  @ApiProperty({ title: 'ID документа' })
  @IsNumber()
  id: number;
  @ApiProperty({ title: 'ID счета' })
  @IsNumber()
  invoiceId: number;
  @ApiProperty({ title: 'Имя файла' })
  @IsString()
  name: string;
  @ApiProperty({
    title: 'Тип документа',
    enum: InvoiceDocumentType,
  })
  @IsString()
  type: InvoiceDocumentType;
  @ApiProperty({ title: 'Ссылка на файл' })
  @IsString()
  link: string;
}

export class InvoiceLineAccount {
  @ApiProperty({ title: 'ID аккаунта' })
  @IsNumber()
  id: number;
  @ApiProperty({ title: 'Сумма пополнения' })
  @IsNumber()
  sum: number;
  @ApiPropertyOptional({ title: 'Наименование аккаунта', readOnly: true })
  @IsString()
  accountName?: string;
}

export class InvoiceLineEntity implements IInvoiceLine {
  @ApiProperty({ title: 'Активен' })
  @IsBoolean()
  isActive: boolean;
  @ApiProperty({ title: 'Аккаунты', type: [InvoiceLineAccount] })
  accounts: {
    sum: number;
    id: number;
    name: string;
  }[];
  @ApiProperty({ title: 'Наименование системы', enum: SystemName })
  @IsString()
  systemName: SystemName;
  @ApiPropertyOptional({ title: 'Сумма', readOnly: true })
  @IsNumber()
  amount?: number;
}

export class InvoiceEntity {
  @ApiProperty({ title: 'Идентификатор', readOnly: true })
  @IsNumber()
  id: number;
  @ApiProperty({ title: 'ID контракта' })
  @IsNumber()
  contractId: number;
  @ApiProperty({ title: 'Статус', enum: InvoiceStatus })
  @IsString()
  status: InvoiceStatus;
  @ApiProperty({ title: 'Дата создания' })
  @IsDate()
  createdAt: Date;
  @ApiProperty({ title: 'ID клиента' })
  @IsNumber()
  customerId: number;
  @ApiProperty({ title: 'Валюта' })
  @IsCurrency()
  currency: string;
  @ApiProperty({ title: 'Номер счета' })
  @IsString()
  invoiceNumber: string;
  @ApiProperty({ title: 'Позиции счета', type: [InvoiceLineEntity] })
  lines: InvoiceLineEntity[];
  @ApiProperty({
    title: 'Кэшированные настройки систем',
    type: [CustomerSystemSettingsEntity],
  })
  cachedSystemSettings: CustomerSystemSettingsEntity;
  @ApiPropertyOptional({ title: 'Виден ли клиенту' })
  @IsBoolean()
  isVisible: boolean;

  @ApiPropertyOptional({ title: 'Наличие оригинала' })
  @IsBoolean()
  hasOriginal: boolean;

  @ApiProperty({ title: 'ID задачи', readOnly: true })
  @IsNumber()
  taskId?: number;
}
export interface IInvoice {
  id: number;
  contractId: number;
  status: InvoiceStatus;
  createdAt: Date;
  taskId?: number;
  customerId: number;
  currency: string;
  invoiceNumber: string;
  lines: IInvoiceLine[];
  cachedSystemSettings: IInvoiceCachedLines[];
  isVisible: boolean;
  invoiceDocument: IInvoiceDocument[];
  rates?: InvoiceRatesEntity;
}

export type IInvoiceCachedLines = Pick<
  IRegionSystemSettings,
  'lines' | 'minSum' | 'currency' | 'systemName'
>;

export interface IInvoiceDocument {
  id: number;
  link: string;
  name: string;
  type: InvoiceDocumentType;
  invoiceId: number;
}

export interface IInvoiceLine {
  accounts: {
    sum: number;
    id: number;
    name: string;
  }[];
  systemName: SystemName;
  isActive: boolean;
  amount?: number;
  expenseAmount?: number;
  transferAmount?: number;
}
