import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SellRatesEntity {
  @ApiProperty({ title: 'Цена продажи USD', example: 3.27 })
  @IsNumber()
  sellUSD: number;

  @ApiProperty({ title: 'Цена продажи EUR', example: 3.27 })
  @IsNumber()
  sellEUR: number;

  @ApiProperty({ title: 'Цена продажи RUB', example: 3.27 })
  @IsNumber()
  sellRUB: number;
}
