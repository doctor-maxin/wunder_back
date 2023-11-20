import { Account, System } from '@prisma/client';

export type AccountWithSystem = Account & {
  system: System;
};
