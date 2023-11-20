import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { IContact } from '../../../common/interfaces/user.interface';

export class ContactEntity implements IContact {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  contactName: string;

  @ApiProperty()
  @IsString()
  BIC: string;

  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  companyAddress: string;

  @ApiProperty()
  @IsString()
  companyTaxNumber: string;

  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsNumber()
  regionId: number;

  // @ApiPropertyOptional()
  // @IsObject()
  // region?: RegionEntity
}
