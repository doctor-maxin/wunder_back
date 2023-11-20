import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';
import {
  ICustomer,
  IUser,
  IUserCustomerGroup,
} from '../../../common/interfaces/user.interface';
import { CustomerEntity } from './customer.entity';
import { Role } from '@prisma/client';

export class UserEntity implements IUser {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsEmail()
  @ApiProperty()
  @IsString()
  email: string;

  @ApiHideProperty()
  @IsString()
  secret: string;

  @ApiPropertyOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ enum: Role })
  @IsString()
  @IsEnum(Role)
  role: Role;
}

export class UserCustomerEntity extends IntersectionType(
  OmitType(UserEntity, ['role'] as const),
) {
  @ApiProperty({ title: 'Роль', default: Role.CUSTOMER })
  @IsString()
  role: Role;

  @ApiProperty({
    type: CustomerEntity,
  })
  customer: ICustomer;
}

export class ExtendedUser extends IntersectionType(UserEntity) {
  @ApiPropertyOptional({
    type: CustomerEntity,
    description: 'Если роль = пользователь',
  })
  customer?: ICustomer;
}
