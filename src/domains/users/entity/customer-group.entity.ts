import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsString,
} from 'class-validator';
import { ICustomerGroup } from '../../../common/interfaces/user.interface';
import { UserEntity } from './user.entity';
import { Role } from '@prisma/client';

export class CustomerGroupEntity implements ICustomerGroup {
  @ApiProperty({ title: 'Идентификатор' })
  @IsNumber()
  id: number;

  @ApiProperty({ title: 'Email группы' })
  @IsString()
  @IsEmail()
  companyEmail: string;

  @ApiProperty({ title: 'Наименование группы' })
  @IsString()
  companyName: string;

  @ApiProperty({ title: 'Дата создания' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ title: 'Активность', default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ title: 'Дата обновления' })
  @IsDate()
  updatedAt: Date;
  userId: number;
}

export class UserGroupEntity extends IntersectionType(
  OmitType(UserEntity, ['role'] as const),
) {
  @ApiProperty({ title: 'Роль', default: Role.GROUP })
  @IsString()
  role: Role;

  @ApiProperty({
    type: CustomerGroupEntity,
  })
  group: ICustomerGroup;
}
