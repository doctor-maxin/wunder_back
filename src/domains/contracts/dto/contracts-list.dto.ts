import { ListResponse } from '../../../common/schemas/list-response';
import { ContractEntity } from '../entity/contract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject } from 'class-validator';

export class ContractsListDto implements ListResponse<ContractEntity> {
  @ApiProperty({ type: [ContractEntity] })
  @IsObject()
  array: ContractEntity[];
  @ApiProperty()
  @IsNumber()
  count: number;
}
