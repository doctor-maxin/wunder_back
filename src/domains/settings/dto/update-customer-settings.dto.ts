import { IsBoolean, IsNotEmpty, IsNumber, Matches } from 'class-validator';
import { PayType } from '@prisma/client';

export class UpdateCustomerSettingsDto {
  @IsNotEmpty()
  @IsBoolean()
  allowTransfer: boolean;

  @IsNumber()
  balanceUpdateDelay?: number;

  @IsNotEmpty()
  @IsNumber()
  freeHours?: number;

  @IsNotEmpty()
  @IsNumber()
  freeTimes?: number;

  @Matches(/^(0|[1-9][0-9]{0,2})(\d{3})*(\.\d{1,2})?$/)
  hourCost?: number;

  @IsNotEmpty()
  payType: PayType;

  @IsNotEmpty()
  @IsNumber()
  ratesAdds?: number;

  @IsNotEmpty()
  @IsNumber()
  vat?: number;

  @IsBoolean()
  isEDNActive?: boolean;

  @IsNumber()
  paymentWaitingHours?: number;

  @IsNumber()
  projectId?: number;
}
