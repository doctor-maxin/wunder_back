import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CustomerCreateDto {
  @ApiProperty({ title: 'БИК' })
  @IsString()
  BIC: string;

  @ApiProperty({ title: 'Банковский аккаунт' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ title: 'Адрес банка' })
  @IsString()
  bankAddress: string;

  @ApiProperty({ title: 'Наименование банка' })
  @IsString()
  bankName: string;

  @ApiProperty({ title: 'Адрес компании' })
  @IsString()
  companyAddress: string;

  @ApiProperty({ title: 'Email компании' })
  @IsString()
  companyEmail: string;

  @ApiProperty({ title: 'Наименование компании' })
  @IsString()
  companyName: string;

  @ApiProperty({ title: 'Номер телефона компании' })
  @IsString()
  companyPhoneNumber: string;

  @ApiProperty({ title: 'Номер счета компании' })
  @IsString()
  companyTaxNumber: string;

  @ApiProperty({ title: 'Email контактного лица' })
  @IsString()
  contactEmail: string;

  @ApiProperty({ title: 'Наименование контактного лица' })
  @IsString()
  contactName: string;

  @ApiProperty({ title: 'Номер телефона контактного лица' })
  @IsString()
  contactPhoneNumber: string;

  @ApiProperty({ title: 'Активен', default: false })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    title: 'Новый ли пользователь',
    default: false,
    description: 'Вспомогательное поле, не влияет на логику',
  })
  @IsBoolean()
  isNew: boolean;

  @ApiProperty({ title: 'Адрес' })
  @IsString()
  postalAddress: string;

  @ApiProperty({ description: 'Согласие на публичный договор', default: false })
  @IsBoolean()
  publicAgree: boolean;

  @ApiProperty({ title: 'ФИО ответственного лица' })
  @IsString()
  responsiblePersonFullName: string;

  @ApiProperty({ title: 'Должность ответственного лица' })
  @IsString()
  responsiblePersonPosition: string;

  @ApiProperty({ title: 'Тип подписи' })
  @IsString()
  signatureDocumentType: string;
}
