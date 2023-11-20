import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsCurrency,
  IsDecimal,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import {
  IRegionSystemSettings,
  ISystemSettingsLine,
} from '../../../common/interfaces/settings.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class SystemSettingsLineEntity implements ISystemSettingsLine {
  @ApiProperty({ description: 'Идентификатор' })
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  systemSettingsId: number;

  @ApiProperty()
  @IsNumber()
  commission: number;

  @ApiProperty()
  @IsDecimal()
  fromAmount: number;

  @ApiProperty()
  @IsDecimal()
  toAmount: number;

  @ApiProperty()
  @IsString()
  systemName: string;
}

export class CustomerSystemSettingsEntity implements IRegionSystemSettings {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  regionId: number;

  @ApiProperty()
  @IsCurrency()
  currency: string;

  @ApiProperty()
  @IsString()
  systemName: string;

  @ApiProperty()
  @IsDecimal()
  minSum: number | Decimal;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    type: [SystemSettingsLineEntity],
  })
  @IsObject()
  lines: ISystemSettingsLine[];
}
