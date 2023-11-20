import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { AccountEntity } from '../entities/account.entity';

export class CreateAccountDto extends IntersectionType(
  PickType(AccountEntity, [
    'customerId',
    'accountName',
    'site',
    'email',
    'externalAccountId',
    'externalAgency',
    'externalClientId',
    'externalRegion',
    'contractId',
  ] as const),
) {
  @ApiProperty({ title: 'Наименование системы' })
  system: string;
}
