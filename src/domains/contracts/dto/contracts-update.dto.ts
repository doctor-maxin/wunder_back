import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { ContractType } from '@prisma/client';

export class ContractsUpdateDto {
  @IsString()
  contractType: ContractType;

  @IsString()
  @IsOptional()
  contractService?: string;

  @IsString()
  @IsOptional()
  contractNumber?: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  expireDate?: Date;

  @IsBoolean()
  isActive: boolean;
}
