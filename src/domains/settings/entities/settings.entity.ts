import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { PayType } from '@prisma/client';
import { ISettings } from '../../../common/interfaces/settings.interface';
import { Decimal } from '@prisma/client/runtime/library';

export class SettingsEntity implements ISettings {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  ratesAdds: number;

  @ApiProperty()
  @IsNumber()
  freeHours: number;

  @ApiProperty()
  @IsNumber()
  freeTimes: number;

  @ApiProperty()
  @IsNumber()
  contractId: number;

  @ApiProperty({
    description: 'Двоичное число',
    example: 21.03,
  })
  @IsNumber()
  hourCost: number | Decimal;

  @ApiProperty({ title: 'НДС' })
  @IsNumber()
  vat: number;

  @ApiProperty({ title: 'Политики обработки персональных данных' })
  @IsString()
  personalAgree: string;

  @ApiProperty({ title: 'Публичный договор' })
  @IsString()
  publicContract: string;

  @ApiProperty({
    enum: ['EXPENSES', 'PREPAY', 'POSTPAY'],
    default: 'PREPAY',
    description:
      'Метод расчета (предоплата, постоплата, постоплата по факт. затратам)',
  })
  @IsString()
  payType: PayType;

  @ApiProperty({
    default: true,
    description: 'Разрешены ли перемещения средств между аккаунтами',
  })
  @IsBoolean()
  allowTransfer: boolean;

  @ApiProperty({
    description: 'Идентификатор проекта в PlanFix',
  })
  @IsNumber()
  projectId: number;

  @ApiProperty({
    default: false,
    description: 'Включены ли подписи по EDN',
  })
  @IsBoolean()
  isEDNActive: boolean;
}
