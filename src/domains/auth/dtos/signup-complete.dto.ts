import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteSignupDto {
  @ApiProperty({ title: 'ID кандидата' })
  @IsNumber()
  @IsNotEmpty()
  customerCandidateId: number;

  @ApiProperty({ title: 'Email компании' })
  @IsNotEmpty()
  @IsEmail()
  companyEmail: string;

  @ApiProperty({ title: 'Адрес компании' })
  @IsNotEmpty()
  @IsString()
  companyAddress: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Вспомогательное необязательное поле',
  })
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Включен ли пользователь',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ title: 'Номер телефона компании' })
  @IsPhoneNumber()
  @IsOptional()
  companyPhoneNumber?: string;

  @ApiProperty({ title: 'Адрес компании' })
  @IsOptional()
  @IsString()
  postalAddress: string;

  @ApiProperty({ title: 'ФИО ответственного лица' })
  @IsNotEmpty()
  @IsString()
  responsiblePersonFullName: string;

  @ApiProperty({ title: 'Должность ответственного лица' })
  @IsNotEmpty()
  @IsString()
  responsiblePersonPosition: string;

  @ApiProperty({ title: 'Тип подписи' })
  @IsNotEmpty()
  @IsString()
  signatureDocumentType: string;

  @ApiProperty({ title: 'Наименование банка' })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({ title: 'Номер аккаунта' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ title: 'Адрес банка' })
  @IsNotEmpty()
  @IsString()
  bankAddress: string;

  @ApiProperty({ title: 'БИК банка' })
  @IsNotEmpty()
  @IsString()
  BIC: string;
}
