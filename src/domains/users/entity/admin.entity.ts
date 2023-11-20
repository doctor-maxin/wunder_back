import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { IAdmin } from '../../../common/interfaces/user.interface';
import { UserEntity } from './user.entity';
import { Role } from '@prisma/client';

export class AdminEntity implements IAdmin {
  @ApiProperty({ title: 'Идентификатор' })
  @IsNumber()
  id: number;

  @ApiProperty({ title: 'Имя' })
  @IsString()
  name: string;

  @ApiProperty({ title: 'Идентификатор пользователя' })
  @IsNumber()
  userId: number;
}

export class UserAdminEntity extends IntersectionType(
  OmitType(UserEntity, ['role'] as const),
) {
  @ApiProperty({ title: 'Роль', default: Role.ADMIN })
  @IsString()
  role: Role;

  @ApiProperty({
    type: AdminEntity,
  })
  admin: IAdmin;
}
