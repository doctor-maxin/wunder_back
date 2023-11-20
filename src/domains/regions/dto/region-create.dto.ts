import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsCurrency, IsString } from 'class-validator';

export class RegionCreateDto {
  @ApiProperty({
    title: 'Имя региона',
    example: 'BY',
  })
  name: string;

  @ApiProperty({
    title: 'Активен',
    default: false,
    description: 'Если указан, то все остальные выключаются',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    title: 'Валюта региона',
    example: 'BYN',
  })
  @IsString()
  defaultCurrency?: string;
}
