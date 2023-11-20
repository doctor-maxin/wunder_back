import { ListResponse } from '../../../common/schemas/list-response';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CustomerEntity } from './customer.entity';
import { CustomerCandidateEntity } from './customer-candidate.entity';

export class CustomersResponse implements ListResponse<CustomerEntity> {
  @ApiProperty({
    type: CustomerEntity,
  })
  array: CustomerEntity[];

  @ApiProperty()
  @IsNumber()
  count: number;
}

export class CustomerCandidatesResponse
  implements ListResponse<CustomerCandidateEntity>
{
  @ApiProperty({ type: CustomerCandidateEntity })
  array: CustomerCandidateEntity[];

  @ApiProperty()
  @IsNumber()
  count: number;
}
