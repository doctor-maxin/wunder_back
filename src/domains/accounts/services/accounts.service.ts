import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from '../account.repository';
import { AccountEntity } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { SystemRepository } from '../../systems/system.repository';
import { TopUpAccount } from '../dto/top-up-account.dto';
import { CustomerRepository } from '../../users/repositories/customer.repository';
import { ContractsRepository } from '../../contracts/contracts.repository';
import { TransferAccount } from '../dto/transfer-account.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ACCOUNT_CONFIRMED,
  ACCOUNT_TOP_UP_EXPENSES,
  ACCOUNT_TOP_UP_POSTPAY,
  ACCOUNT_TOP_UP_PREPAY,
  ON_ACCOUNT_CREATE,
} from '../../../common/events/events';
import { TasksService } from '../../../services/tasks/tasks.service';
import { EmailService } from '../../../services/email/email.service';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { PayType } from '@prisma/client';
import { AdvertisingService } from '../../../integrations/advertising/advertising.service';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  constructor(
    private readonly taskService: TasksService,
    private readonly systemRepository: SystemRepository,
    private readonly repository: AccountRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
    private readonly advertisingService: AdvertisingService, //         private billsRepository: BillsRepository //         private validatorService: ValidatorService, //         private settingsRepository: SettingsRepository, //         private systemSettingsRepository: SystemSettingsRepository, //
    private readonly contractRepository: ContractsRepository, //
    private readonly customerRepository: CustomerRepository, //         private advertisingService: advertisingService, //         private regionsRepository: RegionsRepository,
  ) {}

  //
  //     async accountsByCustomerId(customerId: number): Promise<AccountWithSystem[]> {
  //         if (isNaN(customerId)) throw new BadRequestException();
  //         return await this.repository.accounts(({
  //             where: {customerId},
  //             include: {system: true}
  //         })) as AccountWithSystem[];
  //     }
  //
  public async getAll(): Promise<AccountEntity[]> {
    return await this.repository.getList();
  }

  public async getCustomerAccounts(
    customerId: number,
  ): Promise<AccountEntity[]> {
    return this.repository.getCustomerAccounts(customerId);
  }

  public async createAccount(
    data: CreateAccountDto,
    customerId: number,
  ): Promise<AccountEntity> {
    if (isNaN(customerId)) throw new BadRequestException();

    const system = await this.systemRepository.getSystem(data.system);
    const account = await this.repository.createAccount(data, system.id);

    this.eventEmitter.emit(ON_ACCOUNT_CREATE, { ...account, system });

    return {
      ...account,
      system,
    };
  }

  public async updateAccount(
    id: number,
    data: UpdateAccountDto,
  ): Promise<AccountEntity> {
    return this.repository.updateAccount(id, data);
  }

  public async updateBalance(id: number): Promise<void> {
    const account = await this.repository.getAccount(id);
    let balance;

    switch (account.system.name) {
      case 'Google Ads':
        balance = await this.advertisingService.getGoogleAdsBalance(
          account.externalAgency,
          account.externalClientId,
          account.externalAccountId,
        );
        break;
      case 'Яндекс Директ':
        balance = await this.advertisingService.getYandexDirectBalance(
          account.externalRegion,
          account.login,
          account.externalAccountId,
        );
        break;
      case 'TikTok':
        balance = await this.advertisingService.getTikTokBalance(
          account.externalRegion,
          account.externalClientId,
        );
        break;
      case 'Facebook':
        balance = await this.advertisingService.getMetaBalance(
          account.externalClientId,
        );
        break;
      case 'MyTarget':
        balance = await this.advertisingService.getMyTargetBalance(
          account.externalClientId,
        );
        break;
    }
    if (!balance)
      balance = {
        balance: account.balance,
      };
    await this.repository.setBalance(id, Number(balance.balance));
  }

  async deleteAccount(id: number): Promise<void> {
    if (isNaN(id)) throw new BadRequestException();
    return this.repository.deleteAccount(id);
  }

  public async activateAccount(
    accountId: number,
    accountData: ActivateAccountDto,
  ): Promise<AccountEntity> {
    try {
      if (isNaN(accountId)) throw new BadRequestException();
      const payload: UpdateAccountDto = {
        isActive: true,
      };
      if (accountData.externalAccountId)
        payload.externalAccountId = accountData.externalAccountId;
      if (accountData.externalAgency)
        payload.externalAgency = accountData.externalAgency;
      if (accountData.externalClientId)
        payload.externalClientId = accountData.externalClientId;
      if (accountData.externalRegion)
        payload.externalRegion = accountData.externalRegion;
      if (accountData.login) payload.login = accountData.login;
      if (accountData.password) payload.password = accountData.password;
      if (accountData.balance && !isNaN(Number(accountData.balance)))
        payload.balance = Number(accountData.balance);

      const account = await this.repository.updateAccount(accountId, payload);

      const customer = await this.customerRepository.getCustomer(
        account.customerId,
      );

      if (!account) throw new BadRequestException();
      this.eventEmitter.emit(ACCOUNT_CONFIRMED, account, customer);

      return account;
    } catch (e) {
      console.log('ERRROR', e);
    }
  }

  async createTopUpBill(data: TopUpAccount): Promise<void> {
    this.logger.debug('[createTopUpBill], data:', data);
    const customer = await this.customerRepository.getCustomer(data.customerId);
    const contract = await this.contractRepository.getContract(data.contractId);
    const { settings } = contract;
    const { payType } = settings;

    if (payType === PayType.PREPAY) {
      this.logger.log(
        'Заявка на пополнение счета по предоплате на ' + customer.companyName,
      );

      await this.eventEmitter.emitAsync(
        ACCOUNT_TOP_UP_PREPAY,
        data.list,
        customer,
        contract,
        settings,
        data.currency,
      );
    } else if (payType === PayType.POSTPAY) {
      this.logger.log(
        'Заявка на пополнение счета по постоплате на ' + customer.companyName,
      );

      await this.eventEmitter.emitAsync(
        ACCOUNT_TOP_UP_POSTPAY,
        data.list,
        customer,
        contract,
        settings,
      );
    } else {
      this.logger.log(
        'Заявка на пополнение счета по факт. затратам на ' +
          customer.companyName,
      );

      await this.eventEmitter.emitAsync(
        ACCOUNT_TOP_UP_EXPENSES,
        data.list,
        customer,
        contract,
        settings,
      );
    }
  }
  //
  //     async generateBillFile({
  //                                generatedBillNumber,
  //                                customer,
  //                                region,
  //                                lines,
  //                                contract,
  //                                settings,
  //                                contacts
  //                            }: IBillGenerator) {
  //         return await this.pdfService.generateBill({
  //             customer,
  //             bill: {
  //                 number: generatedBillNumber,
  //                 createdAt: new Date(),
  //                 lines: lines.filter(line => line.accountId)
  //             },
  //             sign: region.sign,
  //             contacts: contacts,
  //             contract,
  //             settings,
  //             regionName: region.name
  //         });
  //     }
  //

  //
  //     async generatePostPayBill(lines, customer: Customer, contract, settings) {
  //         const generatedBillNumber = await this.billsService.generateBillNumber(
  //             customer.id
  //         );
  //         const region = await this.regionsRepository.activeRegion();
  //         const contacts = await this.regionsRepository.regionContact(region.id);
  //         return await this.generateBillFile({
  //             generatedBillNumber,
  //             customer,
  //             region,
  //             lines,
  //             contract,
  //             settings,
  //             contacts
  //         });
  //     }
  //
  //
  //     private async topUpAccountsWithoutPrepay(
  //         lines,
  //         contract: Contract,
  //         customer: Customer,
  //         settings: Settings
  //     ) {
  //         const globalSettings = await this.settingsRepository.globalSettings();
  //         const documentName = await this.generatePostPayBill(lines, customer, contract, settings);
  //         const parentTask = await this.checkAndCreateParentPostPayTask(customer, settings, globalSettings, documentName);
  //         const bill = await this.billsService.createBill({
  //             customer, globalSettings, task: parentTask,
  //             documentName, contractId: contract.id, payType: "postpay"
  //         });
  //         await this.billsService.createBillLines(lines, customer, contract.id, bill);
  //
  //         await this.planFixService.createCurrencyPostPayTask(bill.number, customer, globalSettings.planFixManagerId, settings.projectId, parentTask);
  //         await this.planFixService.topUpSubTasksPostPay(bill, customer, parentTask, settings);
  //         await this.mailService.topUpAccountCreation(customer.contactEmail, customer.contactName);
  //     }
  //
  //     async generateExpensesBill(lines, customer: Customer, contract: Contract, settings: Settings) {
  //         const generatedBillNumber = await this.billsService.generateBillNumber(
  //             customer.id
  //         );
  //         const region = await this.regionsRepository.activeRegion();
  //         const contacts = await this.regionsRepository.regionContact(region.id);
  //         return await this.generateBillFile({
  //             generatedBillNumber,
  //             customer,
  //             region,
  //             lines,
  //             contract,
  //             settings,
  //             contacts
  //         });
  //     }
  //
  //     async checkAndCreateParentPostPayTask(customer: Customer, settings: Settings, globalSettings: Settings, documentName: string) {
  //         const fromDate = new Date();
  //         fromDate.setDate(1);
  //         fromDate.setHours(0, 0)
  //         const lastDate = new Date();
  //         lastDate.setMonth(lastDate.getMonth() + 1);
  //         lastDate.setDate(0);
  //         lastDate.setHours(0, 0)
  //
  //         const task = await this.prisma.task.findFirst({
  //             where: {
  //                 customerId: customer.id,
  //                 type: TaskType.POSTPAY_MOTHER,
  //                 createdAt: {
  //                     gte: moment.utc(fromDate).toISOString(),
  //                     lt: moment.utc(lastDate).toISOString()
  //                 }
  //             }
  //         });
  //
  //         const remoteTask = task ? await this.planFixService.getTask(task.id.toString()) : null;
  //
  //         if (task && remoteTask && remoteTask.data.task.status.id === 2) {
  //             return task;
  //         } else if (task && remoteTask && remoteTask) {
  //             await this.prisma.task.delete({
  //                 where: {id: task.id}
  //             })
  //         }
  //         if (task) {
  //             await this.prisma.task.delete({
  //                 where: {
  //                     id: task.id
  //                 }
  //             });
  //         }
  //
  //         const taskId = await this.planFixService.createPostPayMotherTask(
  //             customer.companyName,
  //             globalSettings.planFixManagerId,
  //             customer.id,
  //             settings.projectId,
  //             documentName
  //         );
  //
  //         return this.prisma.task.create({
  //             data: {
  //                 id: taskId.data.id,
  //                 type: TaskType.POSTPAY_MOTHER,
  //                 counterparty: {
  //                     connect: {id: customer.id}
  //                 },
  //                 managerId: globalSettings.planFixManagerId
  //             }
  //         });
  //     }
  //
  //     async checkAndCreateParentTask(customer: Customer, settings: Settings, globalSettings: Settings, documentName: string) {
  //         const fromDate = new Date();
  //         fromDate.setDate(1);
  //         fromDate.setHours(0, 0)
  //         const lastDate = new Date();
  //         lastDate.setMonth(lastDate.getMonth() + 1);
  //         lastDate.setDate(0);
  //         lastDate.setHours(0, 0)
  //
  //
  //         const task = await this.prisma.task.findFirst({
  //             where: {
  //                 customerId: customer.id,
  //                 "type": TaskType.EXPENSES_MOTHER,
  //                 createdAt: {
  //                     gte: moment.utc(fromDate).toISOString(),
  //                     lt: moment.utc(lastDate).toISOString()
  //                 }
  //             }
  //         });
  //         const remoteTask = task ? await this.planFixService.getTask(task.id.toString()) : null;
  //         if (task && remoteTask && remoteTask.data.task.status.id === 2) {
  //             return task;
  //         } else if (task && remoteTask && remoteTask) {
  //             await this.prisma.task.delete({
  //                 where: {id: task.id}
  //             })
  //         }
  //         if (task) {
  //             await this.prisma.task.delete({
  //                 where: {
  //                     id: task.id
  //                 }
  //             });
  //         }
  //
  //         const taskId = await this.planFixService.createExpensesMotherTask(
  //             customer.companyName,
  //             globalSettings.planFixManagerId,
  //             customer.id,
  //             settings.projectId,
  //             documentName
  //         );
  //
  //         return this.prisma.task.create({
  //             data: {
  //                 id: taskId.data.id,
  //                 "type": TaskType.EXPENSES_MOTHER,
  //                 counterparty: {
  //                     connect: {id: customer.id}
  //                 },
  //                 createdAt: new Date(),
  //                 managerId: globalSettings.planFixManagerId
  //             }
  //         });
  //     }
  //
  //
  //     async topUpAccountsExpenses(
  //         lines,
  //         contract: Contract,
  //         customer: Customer,
  //         settings: Settings
  //     ) {
  //         const [documentName, globalSettings] = await Promise.all([
  //             this.generateExpensesBill(lines, customer, contract, settings),
  //             this.settingsRepository.globalSettings()
  //         ]);
  //
  //         const parentTask = await this.checkAndCreateParentTask(customer, settings, globalSettings, documentName);
  //         const bill = await this.billsService.createBill({
  //             customer, globalSettings, task: parentTask,
  //             documentName, contractId: contract.id, payType: "expenses"
  //         });
  //         await this.billsService.createBillLines(lines, customer, contract.id, bill);
  //         await this.billsService.createExpensesWaitingTasks(globalSettings, bill, customer, settings, parentTask);
  //         return bill;
  //     }
  //
  public async createTransfer(data: TransferAccount): Promise<void> {
    const contract = await this.contractRepository.getContract(data.contractId);
    const { settings } = contract;

    if (!settings.allowTransfer) {
      throw new BadRequestException('Перенос средств запрещен');
    }
    const [fromAccount, toAccount, customer] = await Promise.all([
      this.repository.getAccount(data.from.accountId),
      this.repository.getAccount(data.to.accountId),
      this.customerRepository.getCustomer(data.customerId),
    ]);

    await this.taskService.createTransferTask();
    await this.emailService.transferAccount(
      customer,
      fromAccount,
      toAccount,
      data.sum,
      data.currency,
    );
    //         const taskId = await this.planFixService.createTransferTask(
    //             customer?.companyName,
    //             regionSettings.planFixManagerId,
    //             customer?.planFixId,
    //             settings.projectId,
    //             fromAccount,
    //             data.transferFromSystem,
    //             toAccount,
    //             data.transferToSystem,
    //             parseFloat(data.transferSum).toLocaleString("by-BY", {
    //                 style: "currency",
    //                 currency: data.transferCurrency
    //             })
    //         );
    //         await this.prisma.task.create({
    //             data: {
    //                 id: taskId.data.id,
    //                 counterparty: {
    //                     connect: {id: customer.id}
    //                 },
    //                 type: TaskType.TRANSFER_ACCOUNTS,
    //                 managerId: regionSettings.planFixManagerId
    //             }
    //         });
    //         const subTask = await this.planFixService.createByeTransferTask(
    //             customer?.companyName,
    //             regionSettings.financialManagerId,
    //             customer?.planFixId,
    //             settings.projectId,
    //             fromAccount,
    //             data.transferFromSystem,
    //             toAccount,
    //             data.transferToSystem,
    //             parseFloat(data.transferSum).toLocaleString("by-BY", {
    //                 style: "currency",
    //                 currency: data.transferCurrency
    //             })
    //         );
    //         await this.prisma.task.create({
    //             data: {
    //                 id: subTask.data.id,
    //                 counterparty: {
    //                     connect: {id: customer.id}
    //                 },
    //                 type: TaskType.BYE_TRANSFER_TASK,
    //                 managerId: regionSettings.financialManagerId
    //             }
    //         });
  }
}
