import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class InvoiceRatesEntity {
  @ApiProperty({
    title: 'ID курса',
  })
  @IsNumber()
  id: number;

  @ApiProperty({ example: '6.16' })
  @IsString()
  eurRate: string;

  @ApiProperty({ example: '6.16' })
  @IsString()
  rubRate: string;

  @ApiProperty({ example: '6.16' })
  @IsString()
  usdRate: string;

  @ApiProperty({ title: 'ID платежа' })
  @IsNumber()
  invoiceId: number;
}
