import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsCurrency,
  IsISO4217CurrencyCode,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ContactEntity } from '../entity/contact.entity';
import {
  RegionSettingEntity,
  UpdateRegionSettings,
} from '../../settings/entities/region-settings.entity';

export class RegionUpdateDto {
  @ApiPropertyOptional({
    type: OmitType(ContactEntity, ['id', 'regionId'] as const),
  })
  @IsObject()
  contacts?: Omit<ContactEntity, 'id' | 'regionId'>;

  @ApiPropertyOptional({ title: 'Валюта региона', example: 'KZT' })
  @IsISO4217CurrencyCode()
  currency?: string;

  @ApiPropertyOptional({ title: 'Активен' })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ title: 'Название региона', example: 'BY' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    title: 'Настройки региона',
    type: OmitType(RegionSettingEntity, ['id', 'regionId'] as const),
  })
  @IsArray()
  settings?: Omit<RegionSettingEntity[], 'id' | 'regionId'>;
}

export class RegionsUpdateDto {
  @ApiProperty({
    description: 'Наименование региона',
    type: UpdateRegionSettings,
  })
  @ValidateNested({ each: true })
  name?: Map<string, UpdateRegionSettings>;
}
