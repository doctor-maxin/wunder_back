import { InvoiceEntity } from '../entity/invoice.entity';
import { PartialType } from '@nestjs/swagger';
import { SystemName } from '../../systems/entity/system.entity';

export class InvoiceWithAccountDto extends PartialType(InvoiceEntity) {
  lines: InvoiceLineWithAccount[];
}

export class InvoiceLineWithAccount {
  systemName: SystemName;
  isActive: boolean;
  accounts: {
    sum: number;
    id: number;
    name: string;
  }[];
  amount?: number;
}
