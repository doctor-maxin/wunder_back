import { OmitType, PartialType } from '@nestjs/swagger';
import { ContractEntity } from './contract.entity';

export class CustomerContractsEntity extends PartialType(
  OmitType(ContractEntity, ['customer', 'settings', 'systemSettings'] as const),
) {}
