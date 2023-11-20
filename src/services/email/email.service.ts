import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ACCOUNT_CONFIRMED,
  ON_CUSTOMER_CANDIDATE_CREATE,
} from '../../common/events/events';
import {
  ICustomer,
  ICustomerCandidate,
} from '../../common/interfaces/user.interface';
import { MailService } from './mail/mail.service';
import { SystemName } from '../../domains/systems/entity/system.entity';
import { AccountEntity } from '../../domains/accounts/entities/account.entity';
import { IInvoice } from '../../domains/invoices/entity/invoice.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailService: MailService) {}

  public async topUpAccountSuccess(customer: ICustomer, actLink: string) {
    await this.mailService.sendActMail(customer.companyEmail, actLink);
    await this.mailService.sendActMail(customer.contactEmail, actLink);
  }
  public async createAccountFailedMail(
    customer: Pick<ICustomer, 'contactEmail' | 'contactName'>,
    systemName: string,
  ): Promise<void> {
    await this.mailService.sendAccountCreationFail(
      customer.contactEmail,
      customer.contactName,
      systemName,
    );
    this.logger.log(
      'Письмо провала создания аккаунта отправлено - ' + customer.contactEmail,
    );
  }

  public async confirmCustomer(
    customer: Pick<ICustomer, 'contactEmail' | 'contactName' | 'companyEmail'>,
    password: string,
  ): Promise<void> {
    await this.mailService.sendCustomerConfirmation(
      customer.contactEmail,
      customer.contactName,
      password,
      customer.companyEmail,
    );
    this.logger.log(
      'Письмо обновление пароля отправлено - ' + customer.contactEmail,
    );
  }

  public async customerCandidateFailRegistration(
    customerCandidate: Pick<ICustomerCandidate, 'contactEmail' | 'companyName'>,
  ): Promise<void> {
    this.logger.log(
      'Отправка письма о проваленной регистрации: ' +
        customerCandidate.contactEmail,
    );

    const result = await this.mailService.sendRegistrationFail(
      customerCandidate.contactEmail,
      customerCandidate.companyName,
    );
    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо проваленной регистрации отправлено - ' +
          customerCandidate.contactEmail,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о проваленной регистрации: ',
        result.response,
      );
    }
  }

  public async customerCandidateSuccessRegistration(
    customerCandidate: Pick<ICustomerCandidate, 'contactEmail' | 'companyName'>,
  ): Promise<void> {
    this.logger.log(
      'Отправка письма об успешной регистрации: ' +
        customerCandidate.contactEmail,
    );

    const result = await this.mailService.sendRegistrationMail(
      customerCandidate.contactEmail,
      customerCandidate.companyName,
    );
    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо успешной регистрации отправлено - ' +
          customerCandidate.contactEmail,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о успешной регистрации: ',
        result.response,
      );
    }
  }

  public async customerFailComplete(
    customer: Pick<ICustomer, 'contactEmail' | 'companyName'>,
  ): Promise<void> {
    this.logger.log(
      'Отправка письма о проваленной проверке данных: ' + customer.contactEmail,
    );

    const result = await this.mailService.sendRegistrationFail(
      customer.contactEmail,
      customer.companyName,
    );
    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо проваленной проверки данных отправлено - ' +
          customer.contactEmail,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о проваленной проверке данных: ',
        result.response,
      );
    }
  }

  @OnEvent(ACCOUNT_CONFIRMED)
  public async accountConfirmed(
    account: AccountEntity,
    customer: ICustomer,
  ): Promise<void> {
    this.logger.log(
      'Отправка письма о подтверждении аккаунта: ' + account.email,
    );
    let result;

    if (
      [
        SystemName.YandexDirect,
        SystemName.YandexNavigator,
        SystemName.YandexView,
      ].indexOf(account.system.name as SystemName) !== -1
    ) {
      result = await this.mailService.sendAccountConfirmation(
        account.accountName,
        account.login,
        account.password,
        customer.contactEmail,
        account.system.name,
        customer.contactName,
      );
    } else {
      result = await this.mailService.sendAccountBaseConfirmation(
        account.accountName,
        customer.contactEmail,
        account.system.name,
        customer.contactName,
      );
    }

    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо подтверждения аккаунта отправлено - ' + account.email,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о подтверждении аккаунта: ',
        result.response,
      );
    }
  }

  public async topUpAccountFailed(
    customer: ICustomer,
    invoice: IInvoice,
  ): Promise<void> {
    let text = ``;
    const systemNames = invoice.lines.map((i) => i.systemName);
    if (systemNames.length === 1) text = `в системе ${systemNames[0]}`;
    if (systemNames.length > 1) text = `в системах ${systemNames.join(', ')}`;

    const result = await this.mailService.sendBillCanceled(
      customer.contactEmail,
      customer.contactName,
      text,
    );
  }

  public async topUpAccount(
    customer: ICustomer,
    documentName: string,
  ): Promise<void> {
    const billLink = `${process.env.FRONTEND_HOST}/download/?type=bills&name=${documentName}`;

    const result = await this.mailService.sendBill(
      customer.contactEmail,
      billLink,
    );
    await this.mailService.sendBill(customer.companyEmail, billLink);

    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо о пополнении счета отправлено - ' + customer.contactEmail,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о получении счета: ',
        result.response,
      );
    }
  }

  @OnEvent(ON_CUSTOMER_CANDIDATE_CREATE)
  public async completeRegistrationMail(
    customer: Pick<ICustomerCandidate, 'id' | 'contactEmail' | 'contactName'>,
  ): Promise<void> {
    this.logger.log('Отправка письма о регистрации: ' + customer.contactEmail);

    const link = `${process.env.FRONTEND_HOST}/auth/onboarding?id=${customer.id}`;
    const result = await this.mailService.sendCompleteRegistrationMail(
      customer.contactEmail,
      customer.contactName,
      link,
    );

    if (result && result.response.search('250') !== -1) {
      this.logger.log(
        'Письмо регистрации отправлено - ' + customer.contactEmail,
      );
    } else {
      this.logger.debug(
        'Результат отправки письма о регистрации: ',
        result.response,
      );
    }
  }

  public async fullRegistrationEmail(
    customer: Pick<ICustomer, 'contactEmail' | 'contactName' | 'companyEmail'>,
    password: string,
  ): Promise<void> {
    await this.mailService.sendCustomerConfirmation(
      customer.contactEmail,
      customer.contactName,
      password,
      customer.companyEmail,
    );
    this.logger.log(
      'Письмо на полное завершение регистрации отправлено - ' +
        customer.contactEmail,
    );
  }

  public async transferAccount(
    customer: ICustomer,
    fromAccount: AccountEntity,
    toAccount: AccountEntity,
    sum: number,
    currency: string,
  ): Promise<void> {
    await this.mailService.sendTransferCreate({
      name: customer.contactName,
      email: customer.contactEmail,
      fromAccount: fromAccount.accountName,
      fromSystem: fromAccount.system.name,
      toAccount: toAccount.accountName,
      toSystem: toAccount.system.name,
      amount: sum.toLocaleString('by-BY', {
        style: 'currency',
        currency: currency,
      }),
    });
    this.logger.log(
      'Письмо на пероенос средств отправлено - ' + customer.contactEmail,
    );
  }
}
