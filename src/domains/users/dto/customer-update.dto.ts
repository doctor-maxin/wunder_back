import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class CustomerUpdateDto {
  // Bank info
  @ApiPropertyOptional({ title: 'БИК' })
  @IsOptional()
  @IsString()
  BIC?: string;

  @ApiPropertyOptional({ title: 'Банковский аккаунт' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ title: 'Адрес банка' })
  @IsOptional()
  @IsString()
  bankAddress?: string;

  @ApiPropertyOptional({ title: 'Наименование банка' })
  @IsOptional()
  @IsString()
  bankName?: string;

  // Company info

  @ApiPropertyOptional({ title: 'Адрес компании' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ title: 'Email компании' })
  @IsString()
  @IsOptional()
  companyEmail?: string;

  @ApiPropertyOptional({ title: 'Наименование компании' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ title: 'Номер телефона компании' })
  @IsString()
  @IsOptional()
  companyPhoneNumber?: string;

  @ApiPropertyOptional({ title: 'Номер счета компании' })
  @IsOptional()
  @IsString()
  companyTaxNumber?: string;

  @ApiPropertyOptional({ title: 'Email контактного лица' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @ApiPropertyOptional({ title: 'Наименование контактного лица' })
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ title: 'Номер телефона контактного лица' })
  @IsOptional()
  @IsString()
  contactPhoneNumber?: string;

  @ApiPropertyOptional({ title: 'Активен', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ title: 'ID PlanFix' })
  @IsNumber()
  @IsOptional()
  planFixId?: number;

  @ApiPropertyOptional({
    title: 'Новый ли пользователь',
    default: false,
    description: 'Вспомогательное поле, не влияет на логику',
  })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiPropertyOptional({ title: 'День рождения компании' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ title: 'Адрес' })
  @IsOptional()
  @IsString()
  postalAddress?: string;

  @IsOptional()
  @ApiPropertyOptional({ title: 'ФИО ответственного лица' })
  @IsString()
  responsiblePersonFullName?: string;

  @ApiPropertyOptional({ title: 'Должность ответственного лица' })
  @IsOptional()
  @IsString()
  responsiblePersonPosition?: string;

  @ApiPropertyOptional({ title: 'Тип подписи' })
  @IsOptional()
  @IsString()
  signatureDocumentType?: string;
}
