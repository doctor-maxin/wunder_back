import { ICustomer, IUser } from '../../../common/interfaces/user.interface';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { IContract } from '../../../common/interfaces/account.interface';
import * as timers from 'timers';

export class CustomerEntity implements ICustomer {
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

  @ApiPropertyOptional({ title: 'Контракты' })
  @IsObject()
  contracts?: IContract[];

  @ApiProperty({ title: 'Дата создания' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ title: 'Идентификатор' })
  @IsNumber()
  id: number;

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

  @ApiHideProperty()
  updatedAt: Date;

  @ApiHideProperty()
  user?: IUser;

  @ApiProperty({ title: 'Идентификатор пользователя' })
  @IsNumber()
  userId: number;
}

export class CustomerPasswordResponse {
  @ApiProperty({ title: 'Новый пароль' })
  @IsString()
  password: string;
}
