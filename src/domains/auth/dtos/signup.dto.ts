import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserAdminPayload {
  @ApiProperty({ title: 'Имя администратора' })
  @IsString()
  name: string;
}

export class CreateUserGroupPayload {
  @ApiProperty({ title: 'Наименование компании' })
  @IsString()
  companyName: string;
}

export class CreateUserCustomerPayload {
  @ApiProperty({ title: 'Наименование компании' })
  @IsString()
  companyName: string;

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
}

export class CreateUserDto {
  @ApiProperty({ title: 'Email' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ title: 'Пароль' })
  @IsNotEmpty()
  @IsString()
  secret: string;

  @ApiProperty({
    title: 'Роль',
    enum: Object.values(Role),
  })
  @IsNotEmpty()
  @IsString()
  role: Role;

  @ApiProperty({
    // oneOf: [
    //   { $ref: getSchemaPath(typeof CreateUserAdminPayload) },
    //   {
    //     $ref: getSchemaPath(typeof CreateUserGroupPayload),
    //   },
    //   {
    //     $ref: getSchemaPath(typeof CreateUserCustomerPayload),
    //   },
    // ],
  })
  @IsObject()
  payload:
    | CreateUserAdminPayload
    | CreateUserGroupPayload
    | CreateUserCustomerPayload;
}

export class SignUpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  companyTaxNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  contactPhoneNumber: string;

  @ApiProperty()
  @IsBoolean()
  publicAgree: boolean;

  @ApiProperty()
  @IsBoolean()
  personalAgree: boolean;
}
