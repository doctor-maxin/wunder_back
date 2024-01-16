import { Module } from '@nestjs/common';
import { RegionsRepository } from './domains/regions/regions.repository';
import { SettingsRepository } from './domains/settings/repositories/settings.repository';
import { SystemSettingsRepository } from './domains/settings/repositories/system-settings.repository';
import { UserRepository } from './domains/users/repositories/user.repository';
import { CustomerCandidateRepository } from './domains/users/repositories/customer-candidate.repository';
import { CustomerRepository } from './domains/users/repositories/customer.repository';
import { AccountRepository } from './domains/accounts/account.repository';
import { TaskRepository } from './services/tasks/repositories/tasks.repository';
import { WaitingTaskRepository } from './services/tasks/repositories/waiting-task.repository';
import { ContractsRepository } from './domains/contracts/contracts.repository';
import { DocumentRepository } from './domains/documents/document.repository';
import { RatesRepository } from './domains/rates/rates.respository';
import { SystemRepository } from './domains/systems/system.repository';
import { InvoiceRepository } from './domains/invoices/repositories/invoice.repository';
import { InvoiceDocumentRepository } from './domains/invoices/repositories/invoice-document.repository';
import { AccumulativeDiscountRepository } from './domains/accumulative-discount/accumulative-discount.repository'

@Module({
  providers: [
    RegionsRepository,
    SettingsRepository,
    SystemSettingsRepository,
    UserRepository,
    CustomerCandidateRepository,
    CustomerRepository,
    AccountRepository,
    TaskRepository,
    WaitingTaskRepository,
    ContractsRepository,
    DocumentRepository,
    RatesRepository,
    SystemRepository,
    InvoiceRepository,
    InvoiceDocumentRepository,
    AccumulativeDiscountRepository
  ],
  exports: [
    RegionsRepository,
    SettingsRepository,
    SystemSettingsRepository,
    UserRepository,
    CustomerCandidateRepository,
    CustomerRepository,
    AccountRepository,
    TaskRepository,
    WaitingTaskRepository,
    ContractsRepository,
    DocumentRepository,
    RatesRepository,
    SystemRepository,
    InvoiceRepository,
    InvoiceDocumentRepository,
    AccumulativeDiscountRepository
  ],
})
export class RepositoriesModule { }
