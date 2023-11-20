import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class ListResponse<T> {
  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsArray()
  array: T[];
}
