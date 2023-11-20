import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsCurrency, IsNumber, IsString } from 'class-validator';
import { IRegion } from '../../../common/interfaces/region.interface';

export class RegionEntity implements IRegion {
  @ApiProperty({
    title: 'Идентификатор',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    title: 'Название',
    default: 'BY',
  })
  @IsString()
  name: string;

  @ApiProperty({
    title: 'Активен',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    title: 'Валюта',
    default: 'BYN',
  })
  @IsCurrency()
  currency: string;

  @ApiPropertyOptional({
    title: 'Ссылка на подпись',
    example: 'https://example.ru/ad41a4e3-c2e6-4a41-bc62-d403792d8720',
  })
  @IsString()
  sign?: string;
}

export enum RegionNames {
  BY = 'BY',
  KZ = 'KZ',
  UZ = 'UZ',
}
