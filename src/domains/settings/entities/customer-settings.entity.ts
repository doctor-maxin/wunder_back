import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { SettingsEntity } from './settings.entity';
import { ICustomerSettings } from '../../../common/interfaces/settings.interface';
import { IsNumber, IsObject } from 'class-validator';
import { ICustomer } from '../../../common/interfaces/user.interface';

export class CustomerSettingsEntity
  extends IntersectionType(SettingsEntity)
  implements ICustomerSettings
{
  @ApiProperty()
  @IsNumber()
  customerId: number;

  // @ApiPropertyOptional({ type: CustomerEntity })
  // @IsObject()
  // customer?: ICustomer;
}
