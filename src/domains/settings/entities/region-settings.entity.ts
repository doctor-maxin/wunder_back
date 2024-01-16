import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsCurrency,
  IsISO4217CurrencyCode,
  IsEmail,
  IsNumber,
  IsObject,
  IsString,
  IsOptional,
} from 'class-validator';
import { SettingsEntity } from './settings.entity';
import { RegionSystemSettingsEntity } from './region-system-settings.entity';
import { ContactEntity } from '../../regions/entity/contact.entity';
import { IContact } from '../../../common/interfaces/user.interface';
import { IRegionSettings } from '../../../common/interfaces/settings.interface';

export class RegionSettingEntity
  extends OmitType(IntersectionType(SettingsEntity), [
    'personalAgree',
    'publicContract',
  ] as const)
  implements IRegionSettings {
  @ApiProperty({
    title: 'Почта от кого будут поступать письма',
    example: 'info@wunder.com',
  })
  @IsString()
  @IsEmail()
  emailFrom: string;

  @IsString()
  @ApiProperty({ title: 'ИД менеджера Plan Fix', example: 'contact:462' })
  planFixManagerId: string;

  @IsString()
  @ApiProperty({
    title: 'ИД финансового менеджера в Plan Fix',
    example: 'user:182',
  })
  financialManagerId: string;

  @IsString()
  @ApiPropertyOptional({
    title: 'Ссылка на Telegram канал',
    default: 'Если не указан, то кнопка не отображается',
  })
  telegramLink?: string;

  @IsString()
  @ApiPropertyOptional({
    title: 'Заготовленный текст WhatsApp',
    default: 'Текст который будет набран при нажатии на кнопку whatsapp',
  })
  whatappText?: string;

  @IsString()
  @ApiPropertyOptional({
    title: 'Номер телефона WhatsApp',
    default: 'Если не указан, то кнопка не отображается',
  })
  whatappPhone?: string;

  @IsString()
  @ApiPropertyOptional({
    title: 'Номер телефона',
    description:
      'Номер телефона для отедльной кнопки звонка, если не указан, то не отображается',
  })
  telPhone?: string;

  @ApiProperty()
  @IsNumber()
  regionId: number;

  @ApiProperty({
    default: 72,
    description: 'Время для оплаты счетов, в часах',
  })
  @IsNumber()
  paymentWaitingHours: number;

  @ApiProperty({
    default: 10,
    description: 'Задержка обновления баланса, в минутах',
  })
  @IsNumber()
  balanceUpdateDelay: number;

  @IsString()
  @ApiProperty({
    description: 'Email для жалоб'
  })
  complaintEmail: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Включена форма жалоб'
  })
  complaintForm: boolean;
}

export class UpdateRegionSettings {
  /*
    @ApiProperty({description: 'Обновить настройки всех клиентов'})
    @IsBoolean()
    updateAllClients: boolean;

    @ApiProperty({description: 'Обновить настройки всех публичных клиентов'})
    @IsBoolean()
    updatePublicContractClients: boolean;
*/
  @ApiProperty({ title: 'Валюта региона' })
  @IsISO4217CurrencyCode()
  currency: string;

  @ApiProperty({ title: 'Активен' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ title: 'Наименование региона' })
  @IsString()
  name: string;

  @ApiProperty({ type: ContactEntity, title: 'Контактные данные региона' })
  @IsObject()
  contacts: IContact;

  @ApiProperty({ type: [RegionSystemSettingsEntity] })
  @IsArray()
  systemSettings: RegionSystemSettingsEntity[];

  @ApiProperty({
    type: OmitType(RegionSettingEntity, ['regionId', 'contractId'] as const),
  })
  settings: Omit<RegionSettingEntity, 'regionId' | 'contractId'>;

  @ApiPropertyOptional({
    description: 'Обновить все настройки для всех клиентов',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  updateAllClients?: boolean;

  @ApiPropertyOptional({
    description: 'Обновить все настройки для клиентов по публичному договору',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  updatePublicContractClients?: boolean;
}
