import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RatesFilters {
  @ApiProperty({ description: 'Сколько пропустить' })
  @IsNumber()
  skip: number;

  @ApiProperty({ description: 'Сколько принять' })
  @IsNumber()
  limit: number;
}

export class RatesFiltersEntity {
  @ApiProperty({
    type: RatesFilters,
    description: 'JSON формат фильтров',
    example: JSON.stringify({
      skip: 0,
      limit: 10,
    }),
  })
  filters: RatesFilters;
}
