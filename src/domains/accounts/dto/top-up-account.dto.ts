import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { SystemName } from '../../systems/entity/system.entity';

export class TopUpAccountLineAccount {
  @ApiProperty({ description: 'ID аккаунта' })
  @IsNumber()
  accountId: number;

  @ApiProperty({ description: 'Сумма пополнения' })
  @IsNumber()
  sum: number;
}

export class TopUpAccountLine {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    type: SystemName,
    description: 'Название рекламной системы',
    enum: Object.keys(SystemName),
  })
  systemName: SystemName;

  @ApiProperty({
    type: [TopUpAccountLineAccount],
  })
  accounts: TopUpAccountLineAccount[];
}

export class TopUpAccount {
  @ApiProperty()
  @IsNumber()
  customerId: number;

  @ApiProperty()
  @IsNumber()
  contractId: number;

  @ApiProperty({
    type: [TopUpAccountLine],
  })
  list: TopUpAccountLine[];

  @ApiProperty()
  @IsString()
  currency: string;
}
