import { ApiProperty } from '@nestjs/swagger';
import { IsCurrency, IsNumber, IsString } from 'class-validator';

export class TransferAccountLine {
  @ApiProperty({ description: 'Название рекламной системы' })
  @IsString()
  systemName: string;

  @ApiProperty({ description: 'ID аккаунта' })
  @IsNumber()
  accountId: number;
}

export class TransferAccount {
  @ApiProperty()
  @IsNumber()
  customerId: number;

  @ApiProperty()
  @IsNumber()
  contractId: number;

  @ApiProperty({ description: 'Сумма переноса' })
  @IsNumber()
  sum: number;

  @ApiProperty({ description: 'Валюта переноса', default: 'BYN' })
  @IsCurrency()
  currency: string;

  @ApiProperty({ title: 'Откуда' })
  from: TransferAccountLine;

  @ApiProperty({ title: 'Куда' })
  to: TransferAccountLine;
}
