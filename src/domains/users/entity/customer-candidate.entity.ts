import { ICustomerCandidate } from '../../../common/interfaces/user.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CustomerCandidateEntity implements ICustomerCandidate {
  @ApiProperty({ title: 'Наименование компании' })
  @IsString()
  companyName: string;

  @ApiProperty({ title: 'БИН компании' })
  @IsString()
  companyTaxNumber: string;

  @ApiProperty({ title: 'Контактный email' })
  @IsString()
  contactEmail: string;

  @ApiProperty({ title: 'Имя контактного лица' })
  @IsString()
  contactName: string;

  @ApiProperty({ title: 'Контактный номер телефона' })
  @IsString()
  contactPhoneNumber: string;

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ title: 'Согласие с публичными условиями' })
  @IsBoolean()
  publicAgree: boolean;

  @ApiPropertyOptional({ title: 'Наименование региона' })
  @IsString()
  regionName?: string;

  @ApiPropertyOptional({
    description: 'ID задачи',
  })
  @IsNumber()
  taskId?: number;
}
