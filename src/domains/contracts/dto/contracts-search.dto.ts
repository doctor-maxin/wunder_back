import { IsNumber } from 'class-validator';
import { DateFilter } from '../../../common/schemas/date-filter';
import { Prisma } from '@prisma/client';

export class ContractsSearchDto {
  @IsNumber()
  customerId?: number;

  @IsNumber()
  id?: number;

  startDate?: DateFilter;
  expireDate?: DateFilter;

  OR?: Prisma.Enumerable<Prisma.ContractWhereInput>;
}
