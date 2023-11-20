import { PayType } from '@prisma/client';
export class CreateSettingsDto {
  emailFrom?: string;
  planFixManagerId?: string;
  financialManagerId?: string;
  telegramLink?: string;
  regionId?: number;
  ratesAdds?: number;
  freeHours?: number;
  freeTimes?: number;
  hourCost?: number;
  vat?: number;
  payType?: PayType;
  balanceUpdateDelay?: number;
  allowTransfer?: boolean;
  paymentWaitingHours?: number;
  projectId?: number;
  isEDNActive?: boolean;
  customerId: number;
  publicContract?: string;
  personalAgree?: string;
}
