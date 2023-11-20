import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { SystemEntity } from '../../systems/entity/system.entity';
import { ISystem } from '../../../common/interfaces/settings.interface';

export class AccountEntity {
  @ApiProperty({
    title: 'Идентификатор',
    readOnly: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({ title: 'Наименование аккаунта' })
  @IsString()
  accountName: string;

  @ApiProperty({ title: 'ID пользователя аккаунта' })
  @IsNumber()
  customerId: number;

  @ApiPropertyOptional({ title: 'ID контракта аккаунта' })
  @IsNumber()
  contractId: number;

  @ApiProperty({ title: 'ID системы аккаунта' })
  @IsNumber()
  systemId: number;

  @ApiPropertyOptional({ title: 'Email аккаунта' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ title: 'Активен', default: false })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ title: 'Логин аккаунта', default: '' })
  @IsString()
  login: string;

  @ApiPropertyOptional({ title: 'Пароль аккаунта', default: '' })
  @IsString()
  password: string;

  @ApiProperty({ title: 'Адрес сайта' })
  @IsString()
  @IsUrl()
  site: string;

  @ApiPropertyOptional({ description: 'Внешний аккаунт' })
  @IsString()
  externalAccountId?: string;

  @ApiPropertyOptional({ description: 'Внешний пользователь' })
  @IsString()
  externalClientId?: string;

  @ApiPropertyOptional({ description: 'Внешнее агенство/группа' })
  @IsString()
  externalAgency?: string;

  @ApiPropertyOptional({ description: 'Внешний регион аккаунта' })
  @IsString()
  externalRegion?: string;

  @ApiProperty({ title: 'Баланс', default: 0.0 })
  @IsNumber()
  balance: number;

  @ApiProperty({ type: SystemEntity })
  system: ISystem;

  @ApiPropertyOptional()
  @ApiHideProperty()
  @IsOptional()
  @IsNumber()
  taskId?: number;
}
