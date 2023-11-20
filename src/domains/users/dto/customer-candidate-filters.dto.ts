import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumber } from 'class-validator';

export class CustomerCandidateQueryFilters {
  @ApiProperty()
  @IsNumber()
  limit: number;
  @ApiProperty()
  @IsNumber()
  skip: number;
}

export class CustomerCandidateListQuery {
  @ApiProperty({
    type: CustomerCandidateQueryFilters,
  })
  @IsJSON()
  filters: string;
}
