import { Contacts, Settings } from '@prisma/client';

export interface IBillGenerator {
  generatedBillNumber: string;
  customer: any;
  region: any;
  lines: any;
  contract: any;
  settings: Settings;
  contacts: Contacts;
}

export interface IBillAcceptor {
  bill: {
    number: string;
    lines: any;
    createdAt: Date;
  };
  contacts: Contacts;
  sign: string;
  customer: any;
  contract: any;
  settings: Settings;
  regionName: string;
}
