import { CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Interval } from '@nestjs/schedule';
import { PFStatusFull } from './entity/pf-task.entity';
import { PlanFixTransport } from './planfix.transport';
import { PlanFixStatus } from './planfix.types';
import * as passwordGenerator from 'generate-password';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IRegionSettings } from '../../common/interfaces/settings.interface';
import { TasksService } from '../../services/tasks/tasks.service';
import { RegionsRepository } from '../../domains/regions/regions.repository';
import { SettingsRepository } from '../../domains/settings/repositories/settings.repository';
import { CustomerCandidateRepository } from '../../domains/users/repositories/customer-candidate.repository';
import { EmailService } from '../../services/email/email.service';
import { CustomerRepository } from '../../domains/users/repositories/customer.repository';
import { HashService } from '../../domains/auth/services/hash.service';
import { AccountRepository } from '../../domains/accounts/account.repository';
import { InvoiceRepository } from '../../domains/invoices/repositories/invoice.repository';
import { InvoiceDocumentRepository } from '../../domains/invoices/repositories/invoice-document.repository';
import {
  ICustomer,
  ICustomerCandidate,
} from '../../common/interfaces/user.interface';
import { IAccount } from '../../common/interfaces/account.interface';
import { TaskType } from '../../common/types/taskType.enum';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceService } from '../../domains/invoices/invoice.service';
import { IInvoice } from '../../domains/invoices/entity/invoice.entity';
import { ITask } from '../../common/interfaces/task.interface';
import {
  ACCOUNT_CONFIRMED,
  ON_CUSTOMER_COMPLETE_SIGNUP,
} from '../../common/events/events';
import { AccountEntity } from '../../domains/accounts/entities/account.entity';
import { TaskRepository } from '../../services/tasks/repositories/tasks.repository';

@Injectable()
export class PlanFixService {
  private regionSettingsCache: Record<string, IRegionSettings> = {};

  constructor(
    private readonly taskService: TasksService,
    private readonly regionRepository: RegionsRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly planfixTransport: PlanFixTransport,
    private readonly jwtService: JwtService,
    private readonly taskRepository: TaskRepository,
    private readonly customerCandidateRepository: CustomerCandidateRepository,
    private readonly mailService: EmailService,
    private readonly customerRepository: CustomerRepository,

    private readonly hashService: HashService,
    private readonly eventEmitter: EventEmitter2,
    private readonly accountRepository: AccountRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceDocumentRepository: InvoiceDocumentRepository,
    private readonly invoiceService: InvoiceService,
  ) {}

  private readonly logger = new Logger(PlanFixService.name);

  public async generateToken() {
    const token = await this.jwtService.signAsync(
      {
        sub: 'planFix',
      },
      {
        secret: process.env.PLAN_FIX_TOKEN_SECRET,
        expiresIn: process.env.PLAN_FIX_TOKEN_EXPIRES_IN,
      },
    );
    return { token };
  }

  @UseInterceptors(CacheInterceptor)
  private async getRegionSettings(
    regionName?: string,
  ): Promise<IRegionSettings> {
    if (this.regionSettingsCache[regionName]) {
      return this.regionSettingsCache[regionName];
    }

    if (this.regionSettingsCache[process.env.DEFAULT_REGION]) {
      return this.regionSettingsCache[process.env.DEFAULT_REGION];
    }

    const region = await this.regionRepository.activeRegion();
    const settings = await this.settingsRepository.globalSettings(region.id);
    this.regionSettingsCache[region.name] = settings;

    return settings;
  }

  @Interval(5 * 60 * 1000)
  private async updateRegionSettingsCache() {
    const region = await this.regionRepository.activeRegion();
    const settings = await this.settingsRepository.globalSettings(region.id);

    this.regionSettingsCache[region.name] = settings;
  }

  public async cancelTasks(ids: number[]): Promise<void> {
    await Promise.all(
      ids.map((id) =>
        this.planfixTransport.completePFTask(id, PlanFixStatus.Fail),
      ),
    );
  }

  public async createCounterPartyTask(
    customer: ICustomer,
    managerId: string,
    projectId: number,
  ): Promise<number> {
    const link = `${process.env.FRONTEND_HOST}/admin?editClient=${customer.id}&tab=accountData`;
    const { publicAgree } = customer;

    return await this.planfixTransport.createPFTask({
      title: `ID контрагента ${customer.companyName}`,
      managerId,
      description: `Проверить наличие контрагента в PlanFix, добавить числовое значение ID и создать договор для клиента в административной панели: ${link}.<br/>
        Клиент по ${publicAgree ? 'публичному' : 'уникальному'} договору`,
      projectId: projectId,
      counterparty: customer.planFixId,
    });
  }

  public async createAccountTask(
    customer: ICustomer,
    account: IAccount,
    managerId: string,
    projectId: number,
  ): Promise<number> {
    const link = `${process.env.FRONTEND_HOST}/admin?account=${account.id}&customer=${customer.id}`;
    const emailType =
      account.system.name === 'MyTarget' ? 'VK Ads ID' : 'Email';

    return await this.planfixTransport.createPFTask({
      title: `Создание ${account.system.name} ${customer.companyName}`,
      managerId,
      description: `Ввести данные аккаунта клиента: ${link}<br/>
            ${emailType}: ${account.email ? account.email : '-'}<br/>
            Наименование: ${account.accountName}<br/>
            Сайт для продвижения: ${account.site}<br/>
         `,
      projectId,
      counterparty: customer.planFixId,
    });
  }

  public async createPreSignUpTask(
    customer: Pick<ICustomerCandidate, 'id' | 'publicAgree' | 'companyName'> & {
      regionName?: string;
    },
  ): Promise<number> {
    const settings = await this.getRegionSettings(customer.regionName);
    const link = `${process.env.FRONTEND_HOST}/admin/customer-candidates/?id=${customer.id}`;
    console.log('settings', settings);
    const description = `Регистрационные данные: ${link}<br /> Клиент по ${
      customer.publicAgree ? 'публичному' : 'уникальному'
    } договору`;

    return this.planfixTransport.createPFTask({
      title: `Первичная регистрация ${customer.companyName}`,
      managerId: settings.planFixManagerId,
      description,
      projectId: settings.projectId,
    });
  }

  public async createCompleteSignUpTask(
    customer: Pick<ICustomer, 'id' | 'publicAgree' | 'companyName'>,
    managerId: string,
    projectId: number,
  ): Promise<number> {
    const regDataLink = `${process.env.FRONTEND_HOST}/admin?editClient=${customer.id}`;
    const publicAgree = customer.publicAgree;

    const description = `Проверить регистрационные данные: ${regDataLink}.<br/> Клиент по ${
      publicAgree ? 'публичному' : 'уникальному'
    } договору`;

    return this.planfixTransport.createPFTask({
      title: `Проверка регистрационных данных ${customer.companyName}`,
      managerId,
      description,
      projectId,
    });
  }

  public async closeTask(id: string): Promise<boolean> {
    const actualPFTask = await this.planfixTransport.getTask(id);

    const localTask = await this.taskRepository.getTask(parseInt(id));
    if (!localTask) {
      this.logger.error('Ошибка в получении локальной задачи: ' + id);
      return false;
    }

    this.logger.log('Получен вебхук от planfix на ' + localTask.type);
    let result = false;
    switch (localTask.type) {
      case TaskType.CUSTOMER_CANDIDATE:
        result = await this.closeCustomerCandidateTask(
          localTask,
          actualPFTask.status,
        );
        break;
      case TaskType.NEW_CUSTOMER:
        result = await this.closeCustomerCheckTask(
          localTask,
          actualPFTask.status,
        );
        break;
      case TaskType.COUNTERPARTY_ID:
        result = await this.closeCounterPartyTask(
          localTask,
          actualPFTask.status,
        );
        break;
      case TaskType.NEW_ACCOUNT:
        result = await this.closeAccountTask(localTask, actualPFTask.status);
        break;
      case TaskType.PAYMENT_WAITING:
        result = await this.closePaymentWaitingTask(
          localTask,
          actualPFTask.status,
        );
        break;
      case TaskType.TOP_UP_ACCOUNTS:
        result = await this.closeTopUpTask(localTask, actualPFTask.status);
    }

    return result;
  }

  private async closeTopUpTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    if (status.id === PlanFixStatus.Completed) {
      console.log(localTask);
      const invoice = await this.invoiceRepository.getById(localTask.invoiceId);
      const customer = await this.customerRepository.findById<ICustomer>(
        localTask.customerId ?? invoice.customerId,
      );
      if (!customer) {
        this.logger.error(
          `[closeTopUpTask] not found customer to ${localTask.id} task`,
        );
        return false;
      }
      if (!invoice) {
        this.logger.error(
          `[closeTopUpTask] not found invoice to ${localTask.id} task`,
        );
        return false;
      }
      const closureDocument =
        await this.invoiceDocumentRepository.getActDocument(invoice.id);

      const actLink = `${process.env.FRONTEND_HOST}/download/?type=acts&name=${closureDocument.link}`;

      await this.invoiceRepository.setStatus(
        invoice.id,
        InvoiceStatus.COMPLETED,
      );
      await this.invoiceRepository.setVisibility(invoice.id, true);
      await this.mailService.topUpAccountSuccess(customer, actLink);

      return true;
    }
    return false;
  }

  private async closePaymentWaitingTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findById<ICustomer>(
      localTask.customerId,
    );
    this.logger.log('Закрытие задачи "Ожидание оплаты" ' + localTask.id);
    const invoice = await this.invoiceRepository.getById(localTask.invoiceId);
    this.logger.log('Найден платеж ' + invoice?.id);
    if (!invoice) return;

    if (status.id === PlanFixStatus.Completed) {
      await this.invoiceRepository.setStatus(invoice.id, InvoiceStatus.PAID);
      const document = await this.invoiceDocumentRepository.getBillDocument(
        invoice.id,
      );
      const settings = await this.settingsRepository.findOne({
        contractId: invoice.contractId,
        customerId: customer.id,
      });
      if (!settings) return;
      if (!document) return;

      const parentId = await this.createTopUpTask(
        document.link,
        customer.companyName,
        settings.projectId,
      );

      this.createBuyingCurrencyTask(
        customer,
        localTask,
        settings.projectId,
        invoice.id,
      );

      this.createAccountTopUpTasks(
        customer,
        invoice,
        localTask,
        settings.projectId,
        parentId,
      );
      this.taskService.createAccountTopUpTask(
        customer.id,
        parentId,
        invoice.id,
      ),
        this.invoiceService.generateAct(invoice.id);
      return true;
    } else if (status.id === PlanFixStatus.Fail) {
      await this.invoiceRepository.setStatus(invoice.id, InvoiceStatus.AVOIDED);
      await this.mailService.topUpAccountFailed(customer, invoice);
      return true;
    }
  }

  private async createAccountTopUpTasks(
    customer: ICustomer,
    invoice: IInvoice,
    localTask: ITask,
    projectId: number,
    parentId: number,
  ): Promise<void> {
    const invoiceDocument =
      await this.invoiceDocumentRepository.getBillDocument(invoice.id);
    const billLink = `${process.env.FRONTEND_HOST}/download?type=bills&name=${invoiceDocument.link}`;
    const currencyLink = `${process.env.FRONTEND_HOST}/admin/?invoice=${invoice.id}&customer=${customer.id}`;

    for (const line of invoice.lines) {
      for (const account of line.accounts) {
        const taskId = await this.planfixTransport.createPFTask({
          title: `Пополнение ${account.name} ${customer.companyName}`,
          managerId: localTask.managerId,
          description: `Посмотреть счет в формате PDF: ${billLink}<br/>
                    Прикрепить оригиналы актов, установить курс покупки валюты: ${currencyLink}<br/>`,
          counterparty: customer.planFixId,
          projectId,
          parentTaskId: parentId,
        });
        await this.taskService.createOneAccountTopUpTask(
          localTask,
          customer.id,
          taskId,
          invoice.id,
          account.id,
        );
      }
    }
  }

  private async createBuyingCurrencyTask(
    customer: ICustomer,
    localTask: ITask,
    projectId: number,
    invoiceId: number,
  ): Promise<void> {
    const invoiceDocument =
      await this.invoiceDocumentRepository.getBillDocument(invoiceId);
    const billLink = `${process.env.FRONTEND_HOST}/download?type=bills&name=${invoiceDocument.link}`;

    const task = await this.planfixTransport.createPFTask({
      title: `Покупка валюты ${customer.accountNumber} ${customer.companyName}`,
      managerId: localTask.managerId,
      description: `Посмотреть счет в формате PDF: ${billLink}`,
      projectId: projectId,
      counterparty: customer.planFixId,
    });
    this.logger.log(`Задача по покупке валюты создана: ${task}`);
  }

  private async closeAccountTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    const account = await this.accountRepository.getAccountByTask(localTask.id);
    const customer = await this.customerRepository.findById<ICustomer>(
      localTask.customerId,
    );
    if (status.id === PlanFixStatus.Completed) {
      await this.mailService.accountConfirmed(account, customer);

      return true;
    } else if (status.id === PlanFixStatus.Fail) {
      await this.mailService.createAccountFailedMail(
        customer,
        account.system.name,
      );
      return true;
    }
    return false;
  }

  @OnEvent(ACCOUNT_CONFIRMED)
  private async onAccountConfirmed(account: AccountEntity) {
    this.logger.log('Закрытие задачи по аккаунту ' + account.taskId);
    await this.planfixTransport.completePFTask(account.taskId);
  }

  @OnEvent(ON_CUSTOMER_COMPLETE_SIGNUP)
  private async onCustomerCompleteSignUp(...event) {
    this.logger.log('Закрытие задачи по регистрации ' + event[0].taskId);
    this.planfixTransport.completePFTask(event[0].taskId);
  }

  private async closeCounterPartyTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    if (status.id === PlanFixStatus.Completed) {
      const customer = await this.customerRepository.findById<ICustomer>(
        localTask.customerId,
      );
      if (!customer) return false;

      const password = passwordGenerator.generate({
        length: 10,
        numbers: true,
      });
      const secret = await this.hashService.hashData(password);

      await this.customerRepository.setPassword(customer.userId, secret);
      await this.customerRepository.setCustomerActive(customer.id, true);

      await this.mailService.fullRegistrationEmail(customer, password);
      return true;
    }
    return false;
  }

  private async closeCustomerCheckTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findById<ICustomer>(
      localTask.customerId,
    );

    if (!customer) return false;

    if (status.id === PlanFixStatus.Fail) {
      this.logger.debug('Вызов closeCustomerCheckTask - PlanFixStatus.Fail');

      await this.mailService.customerFailComplete({
        contactEmail: customer.contactEmail,
        companyName: customer.companyName,
      });
      return true;
    } else if (status.id === PlanFixStatus.Completed) {
      const globalSettings = await this.getRegionSettings(customer.regionName);
      this.logger.debug(
        'Вызов closeCustomerCheckTask - PlanFixStatus.Completed',
      );

      await this.taskService.createCustomerCounterPartyTask(
        customer,
        globalSettings.planFixManagerId,
        globalSettings.projectId,
      );

      return true;
    }
  }

  private async closeCustomerCandidateTask(
    localTask: ITask,
    status: PFStatusFull,
  ): Promise<boolean> {
    const customerCandidate = await this.customerCandidateRepository.findById(
      localTask.customerCandidateId,
    );

    if (!customerCandidate) return false;

    if (status.id === PlanFixStatus.Fail) {
      this.logger.debug(
        'Вызов closeCustomerCandidateTask - PlanFixStatus.Fail',
      );
      await this.mailService.customerCandidateFailRegistration({
        contactEmail: customerCandidate.contactEmail,
        companyName: customerCandidate.companyName,
      });
      return true;
    } else if (status.id === PlanFixStatus.Completed) {
      this.logger.debug(
        'Вызов closeCustomerCandidateTask - PlanFixStatus.Completed - customerCandidate.customerId: ' +
          customerCandidate.customerId,
      );

      if (customerCandidate.customerId) {
        const globalSettings = await this.getRegionSettings(
          customerCandidate.regionName,
        );
        const customer = await this.customerRepository.findById<ICustomer>(
          customerCandidate.customerId,
        );

        // await this.mailService.customerCandidateSuccessRegistration({
        //     contactEmail: customerCandidate.contactEmail,
        //     companyName: customerCandidate.companyName,
        // });

        await this.taskService.signUpCompleteTask(
          customer,
          globalSettings.planFixManagerId,
          globalSettings.projectId,
        );

        return true;
      }
    }
  }

  public async createTopUpTask(
    documentName: string,
    companyName: string,
    projectId: number,
  ): Promise<number> {
    const billLink = `${process.env.FRONTEND_HOST}/download?type=bills&name=${documentName}`;
    const settings = await this.getRegionSettings();

    this.logger.log('Создание задачи PF на пополнение ' + companyName);

    return this.planfixTransport.createPFTask({
      title: `Пополнение ${companyName}`,
      managerId: settings.planFixManagerId,
      description: `Посмотреть счет в формате PDF: ${billLink}`,
      projectId: projectId,
    });
  }

  public async createInvoiceWaiting(
    companyName: string,
    billNumber: string,
    projectId: number,
    documentName: string,
  ): Promise<number> {
    const billLink = `${process.env.FRONTEND_HOST}/download?type=bills&name=${documentName}`;
    const settings = await this.getRegionSettings();

    this.logger.log('Создание задачи PF на ожидание оплаты  ' + companyName);

    return this.planfixTransport.createPFTask({
      title: `Ожидание оплаты №${billNumber} ${companyName}`,
      managerId: settings.planFixManagerId,
      description: `Посмотреть счет в формате PDF: ${billLink}`,
      projectId,
    });
  }

  public async createTopUpFailedTask(
    invoice: IInvoice,
    customer: Pick<ICustomer, 'companyName' | 'id'>,
    managerId: string,
    projectId: number,
  ): Promise<number> {
    const name = [
      InvoiceStatus.PAID,
      InvoiceStatus.SIGNED,
      InvoiceStatus.COMPLETED,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    ].includes(invoice.status)
      ? `Проверка оплаты №${invoice.invoiceNumber} ${customer.companyName}`
      : `Не оплачена проверка оплаты №${invoice.invoiceNumber} ${customer.companyName}`;
    return await this.planfixTransport.createPFTask({
      title: name,
      managerId,
      counterparty: customer.id,
      parentTaskId: invoice.taskId,
      projectId,
      description: '',
    });
  }
}
