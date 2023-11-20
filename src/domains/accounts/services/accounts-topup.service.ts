import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ACCOUNT_TOP_UP_PREPAY,
  INVOICE_GENERATE_BILL,
  INVOICE_GENERATE_BILL_SUCCESS,
} from '../../../common/events/events';
import { Injectable, Logger } from '@nestjs/common';
import { TopUpAccountLine } from '../dto/top-up-account.dto';
import { ICustomer } from '../../../common/interfaces/user.interface';
import { IContract } from '../../../common/interfaces/account.interface';
import { ICustomerSettings } from '../../../common/interfaces/settings.interface';
import { InvoiceService } from '../../invoices/invoice.service';
import { ContractType } from '@prisma/client';
import { TasksService } from '../../../services/tasks/tasks.service';
import { EmailService } from '../../../services/email/email.service';
import { SystemSettingsRepository } from '../../settings/repositories/system-settings.repository';
import { InvoiceRepository } from '../../invoices/repositories/invoice.repository';
import { SettingsRepository } from '../../settings/repositories/settings.repository';
import { IInvoice } from '../../invoices/entity/invoice.entity';
import { InvoiceDocumentRepository } from '../../invoices/repositories/invoice-document.repository';
import { CustomerRepository } from '../../users/repositories/customer.repository';
import { PlanFixService } from '../../../integrations/planfix/planfix.service';

@Injectable()
export class AccountsTopUpService {
  private readonly logger = new Logger(AccountsTopUpService.name);
  constructor(
    private readonly planFixService: PlanFixService,
    private readonly invoiceService: InvoiceService,
    private readonly taskService: TasksService,
    private readonly emailService: EmailService,
    private readonly systemSettingsRepository: SystemSettingsRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceDocumentRepository: InvoiceDocumentRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly customerRepository: CustomerRepository,
  ) {}

  @OnEvent(INVOICE_GENERATE_BILL_SUCCESS)
  private async invoiceDocumentGenerated(invoice: IInvoice, filename: string) {
    await this.invoiceDocumentRepository.setBillDocument(invoice.id, filename);
    const globalSettings = await this.settingsRepository.globalSettings();

    const customer = await this.customerRepository.findById<ICustomer>(
      invoice.customerId,
    );
    if (!customer) return;
    const settings = await this.settingsRepository.findOne({
      customerId: customer.id,
      contractId: invoice.contractId,
    });
    if (!settings) return;

    const waitingTaskId = await this.planFixService.createInvoiceWaiting(
      customer.companyName,
      invoice.invoiceNumber,
      settings.projectId,
      filename,
    );
    await Promise.all([
      this.emailService.topUpAccount(customer, filename),
      this.taskService.createInvoiceWaitingTask({
        paymentWaitingHours: globalSettings.paymentWaitingHours,
        invoiceId: invoice.id,
        managerId: globalSettings.planFixManagerId,
        customerId: customer.id,
        id: waitingTaskId,
      }),
    ]);
    await this.invoiceRepository.bindTaskId(invoice.id, waitingTaskId);
  }

  @OnEvent(ACCOUNT_TOP_UP_PREPAY)
  private async topUpAccountsWithPrepay(
    lines: TopUpAccountLine[],
    customer: ICustomer,
    contract: IContract,
    settings: ICustomerSettings,
    currency: string,
  ) {
    const systemSettings =
      contract.contractType === ContractType.STANDARD
        ? await this.systemSettingsRepository.globalSystemSettings()
        : contract.systemSettings;

    const filteredLines = [];
    for (const line of lines) {
      if (line.isActive) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const systemLine = systemSettings.find(
          (s) => s.systemName === line.systemName,
        );
        filteredLines.push(systemLine);
      }
    }

    const invoice = await this.invoiceService.createInvoice({
      lines,
      contractId: contract.id,
      customerId: customer.id,
      currency: currency,
      systemSettings: filteredLines,
    });
    this.logger.debug('Created new invoice ', invoice, {
      lines,
      contractId: contract.id,
      customerId: customer.id,
      currency: currency,
      systemSettings: filteredLines,
    });
    this.eventEmitter.emit(INVOICE_GENERATE_BILL, invoice, customer);
    await this.invoiceRepository.setStatus(invoice.id, 'WAITING');
  }
}
