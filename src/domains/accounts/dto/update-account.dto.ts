import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAccountDto {
  @ApiPropertyOptional({ title: 'Email аккаунта' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ title: 'Наименование аккаунта' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ title: 'Адрес сайта' })
  @IsOptional()
  @IsString()
  site?: string;

  @ApiPropertyOptional({ description: 'Внешний аккаунт' })
  @IsOptional()
  @IsString()
  externalAccountId?: string;

  @ApiPropertyOptional({ description: 'Внешний пользователь' })
  @IsOptional()
  @IsString()
  externalClientId?: string;

  @ApiPropertyOptional({ description: 'Внешнее агенство/группа' })
  @IsOptional()
  @IsString()
  externalAgency?: string;

  @ApiPropertyOptional({ description: 'Внешний регион аккаунта' })
  @IsOptional()
  @IsString()
  externalRegion?: string;

  @ApiPropertyOptional({ title: 'Баланс', default: 0.0 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ title: 'Активен', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ title: 'Логин аккаунта', default: '' })
  @IsOptional()
  @IsString()
  login?: string;

  @ApiPropertyOptional({ title: 'Пароль аккаунта', default: '' })
  @IsOptional()
  @IsString()
  password?: string;
}
