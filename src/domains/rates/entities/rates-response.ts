import { ListResponse } from '../../../common/schemas/list-response';
import { RateEntity } from './rate.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RatesResponse implements ListResponse<RateEntity> {
  @ApiProperty({
    type: RateEntity,
  })
  array: RateEntity[];
  @ApiProperty()
  @IsNumber()
  count: number;
}
