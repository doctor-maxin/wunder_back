import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../../../prisma/prisma.service';
import * as dotenv from 'dotenv';
import { SentMessageInfo } from 'nodemailer';

dotenv.config();

interface ITransferCreate {
  name: string;
  email: string;
  fromAccount: string;
  fromSystem: string;
  toAccount: string;
  toSystem: string;
  amount: string;
}

@Injectable()
export class MailService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async getFrom() {
    const settings = await this.prisma.settings.findFirst({
      where: { region: { isActive: true } },
    });
    if (!settings) return `"Wunder Pay" <${process.env.EMAIL_NAME}>`;
    return `"${settings.emailFrom}" <${process.env.EMAIL_NAME}>`;
  }

  async sendTest() {
    const r = await this.mailerService.sendMail({
      from: `"Wunder Pay" <${process.env.EMAIL_NAME}>`,
      to: '75moneylove75@gmail.com',
      subject: 'Test',
      template: 'test',
    });
    console.log('R', r);
  }

  async sendCustomerConfirmation(
    email: string,
    name: string,
    password: string,
    login: string,
  ) {
    const from = await this.getFrom();
    const link = `${process.env.FRONTEND_HOST}/login`;
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Аккаунт активирован',
      template: './confirmation',
      context: {
        name,
        password,
        link,
        login,
      },
    });
  }

  async sendCompleteRegistrationMail(
    email: string,
    name: string,
    link: string,
  ) {
    const from = await this.getFrom();
    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Регистрация аккаунта',
      template: 'registration',
      context: {
        name,
        link,
      },
    });
  }

  async sendRegistrationMail(email: string, name: string) {
    const from = await this.getFrom();
    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Проверка данных',
      template: './completed',
      context: {
        name,
      },
    });
  }

  async sendTransferCreate(params: ITransferCreate) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: params.email,
      subject: 'Wunder Pay: Запрос на перенос средств',
      template: './transferCreate',
      context: {
        ...params,
      },
    });
  }

  async sendTransferFail(email: string, name: string) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Запрос на перенос средств',
      template: './transferFail',
      context: {
        name,
      },
    });
  }
  async sendBillCanceled(email: string, name: string, systems: string) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Счет аннулирован',
      template: './billCanceled',
      context: {
        name,
        systems,
      },
    });
  }

  async sendTransferSuccess(email: string, name: string) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Запрос на перенос средств',
      template: './transferSuccess',
      context: {
        name,
      },
    });
  }

  async sendAccountCreation(
    accountName: string,
    email: string,
    contactName: string,
  ) {
    const from = await this.getFrom();
    const resp = await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Создание личного кабинета',
      template: './accountCreation',
      context: {
        contactName,
        accountName,
      },
    });
    console.log(resp);
  }

  async sendAccountConfirmation(
    accountName: string,
    login: string,
    password: string,
    email: string,
    systemName: string,
    contactName: string,
  ): Promise<SentMessageInfo> {
    const from = await this.getFrom();
    const link = '';
    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Успешное создание аккаунта',
      template: './confirmationAccount',
      context: {
        contactName,
        login,
        password,
        accountName,
        systemName,
        link,
      },
    });
  }

  async sendAccountBaseConfirmation(
    accountName: string,
    email: string,
    systemName: string,
    contactName: string,
  ) {
    const from = await this.getFrom();
    const link = '';
    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Успешное создание аккаунта',
      template: './confirmationAccountBase',
      context: {
        contactName,
        accountName,
        systemName,
        link,
      },
    });
  }

  async sendBill(email: string, link: string) {
    const from = await this.getFrom();

    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: счет на оплату',
      template: './billMail',
      context: {
        link,
      },
    });
  }

  async topUpAccountCreation(email: string, name: string) {
    const from = await this.getFrom();

    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Пополнение аккаунта',
      template: './topUpAccountCreation',
      context: {
        name,
      },
    });
  }

  async sendActMail(email: string, link: string) {
    const from = await this.getFrom();

    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: акт выполненных работ ',
      template: './actMail',
      context: {
        link,
      },
    });
  }

  async sendRegistrationFail(email: string, name: string) {
    const from = await this.getFrom();
    return this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Отмена регистрации',
      template: './registrationFail',
      context: {
        name,
      },
    });
  }

  async sendAccountCreationFail(email: string, name: string, account: string) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Wunder Pay: Не удалось создать аккаунт',
      template: './accountCreationFail.hbs',
      context: {
        name,
        account,
      },
    });
  }

  async sendPaymentFail(email: string, name: string) {
    const from = await this.getFrom();
    await this.mailerService.sendMail({
      from,
      to: email,
      subject: 'Оплата не получена',
      template: 'paymentFail.hbs',
      context: {
        name,
      },
    });
  }
}
