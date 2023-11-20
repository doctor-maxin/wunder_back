import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ActivateAccountDto {
  @ApiPropertyOptional({ title: 'Логин аккаунта', default: '' })
  @IsString()
  @IsOptional()
  login?: string;

  @ApiPropertyOptional({ title: 'Пароль аккаунта', default: '' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Внешний аккаунт' })
  @IsOptional()
  @IsString()
  externalAccountId?: string;

  @ApiPropertyOptional({ description: 'Внешнее агенство/группа' })
  @IsOptional()
  @IsString()
  externalAgency?: string;

  @ApiPropertyOptional({ title: 'Баланс', default: 0.0 })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ description: 'Внешний регион аккаунта' })
  @IsOptional()
  @IsString()
  externalRegion?: string;

  @ApiPropertyOptional({ description: 'Внешний пользователь' })
  @IsOptional()
  @IsString()
  externalClientId?: string;
}
