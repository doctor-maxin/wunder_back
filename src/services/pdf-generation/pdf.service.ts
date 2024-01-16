import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as ejs from 'ejs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  INVOICE_GENERATE_ACT,
  INVOICE_GENERATE_ACT_SUCCESS,
  INVOICE_GENERATE_BILL,
  INVOICE_GENERATE_BILL_SUCCESS,
} from '../../common/events/events';
import { ICustomer } from '../../common/interfaces/user.interface';
import { ExtendedInvoiceLines } from './pdf.types';
import { RubleHelperService } from '../../helpers/ruble.service';
import { TengeHelperService } from '../../helpers/tenge.service';
import { SettingsService } from '../../domains/settings/settings.service';
import { SettingsRepository } from '../../domains/settings/repositories/settings.repository';
import { RegionsRepository } from '../../domains/regions/regions.repository';
import {
  IInvoice,
  IInvoiceLine,
} from '../../domains/invoices/entity/invoice.entity';
import { RegionNames } from '../../domains/regions/entity/region.entity';
import { SystemName } from '../../domains/systems/entity/system.entity';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  constructor(
    private readonly rubleService: RubleHelperService,
    private readonly tengeService: TengeHelperService,
    private readonly eventEmitter: EventEmitter2,
    private readonly settingsService: SettingsService,
    private readonly settingsRepository: SettingsRepository,
    private readonly regionRepository: RegionsRepository,
  ) {}

  @OnEvent(INVOICE_GENERATE_BILL)
  public async generateBill(
    invoice: IInvoice,
    customer: ICustomer,
  ): Promise<string> {
    this.logger.log('Генерация счета #' + invoice.invoiceNumber);

    const globalSettings = await this.settingsRepository.globalSettings();
    const regionContacts = await this.regionRepository.regionContact(
      globalSettings.regionId,
    );
    const { settings, contract, systemSettings } =
      await this.settingsService.getCustomerSettings(customer.id);

    if (!settings)
      throw new BadRequestException('Настройки контракта не найдены');
    if (!systemSettings)
      throw new BadRequestException('Настройки систем контракта не найдены');

    const invoiceSum = this.getInvoiceSum(invoice.lines);
    const vat = 'vat' in settings ? settings.vat : globalSettings.vat || 0;
    const extendedLines = this.prepareLines(invoice.lines, vat);
    const invoiceVatSum = this.getInvoiceVatSum(extendedLines);
    const invoiceTotal = this.getInvoiceTotal(extendedLines);

    const templateName =
      globalSettings.region.name === RegionNames.KZ
        ? 'bill.kz.ejs'
        : 'bill.ejs';
    const vatString = this.getVatLabel(globalSettings.region.name, vat);

    const totalString = this.getInvoiceSumLabel(
      globalSettings.region.name,
      invoiceSum,
    );

    const image = readFileSync(
      join(
        process.cwd(),
        'documents',
        'sign',
        globalSettings.region.sign,
      ).replace(/\\/g, '/'),
      {
        encoding: 'base64',
      },
    );

    const template = await ejs.renderFile(
      join(__dirname, 'templates', templateName),
      {
        bill: invoice,
        contacts: regionContacts,
        customer,
        contract,
        image,
        lines: extendedLines,
        settingsVat: vat,
        total: {
          total: invoiceTotal,
          vat: invoiceVatSum,
          sum: invoiceSum,
          totalString,
          vatString,
        },
        today: new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    );

    const filename = `${invoice.invoiceNumber.replace('/', '-')}.pdf`;
    const pdfPath = join(process.cwd(), 'documents', 'bills', filename);
    const pdfOptions = {
      path: pdfPath,
    };
    const browser = await puppeteer.launch({
      headless: 'new',

      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({
      deviceScaleFactor: 1,
      width: 595,
      height: 842,
    });
    await page.goto(`data:text/html;charset=UTF-8,${template}`, {
      waitUntil: 'networkidle2',
    });
    await page.setContent(template);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await page.pdf(pdfOptions);
    await browser.close();
    this.logger.log('Сгенерирован документ для счета ' + filename);

    this.eventEmitter.emit(INVOICE_GENERATE_BILL_SUCCESS, invoice, filename);
    return filename;
  }

  private getInvoiceSumLabel(regionName: string, total: number): string {
    return regionName === RegionNames.KZ
      ? this.tengeService.stringTenge(total) || ''
      : this.rubleService.stringRubles(total) || '';
  }

  private getVatLabel(regionName: string, vat: number): string {
    return regionName === RegionNames.KZ
      ? this.tengeService.stringTenge(vat) || ''
      : this.rubleService.stringRubles(vat) || '';
  }

  private getInvoiceVatSum(lines: ExtendedInvoiceLines): number {
    return lines.reduce((acc, line) => acc + line.totalVat, 0);
  }
  private getInvoiceTotal(lines: ExtendedInvoiceLines): number {
    return lines.reduce((acc, line) => acc + line.total, 0);
  }

  private prepareLines(
    lines: IInvoiceLine[],
    vat: number,
  ): ExtendedInvoiceLines {
    return lines.map((line) => {
      const luneSum = line.accounts.reduce((acc, item) => (acc += item.sum), 0);
      const totalVat = luneSum * (vat / (100 + vat));
      let lineType = 'контекстной';
      if (
        [
          SystemName.VK,
          SystemName.Facebook,
          SystemName.MyTarget,
          SystemName.TikTok,
        ].includes(line.systemName)
      )
        lineType = 'таргетированной';

      return {
        ...line,
        totalVat,
        sum: luneSum,
        type: lineType,
        vat,
        total: luneSum - totalVat,
      };
    });
  }
  private getInvoiceSum(lines: IInvoiceLine[]): number {
    return lines.reduce((acc, line) => {
      return (acc += line.accounts.reduce(
        (subacc, acc) => (subacc += acc.sum),
        0,
      ));
    }, 0);
  }

  @OnEvent(INVOICE_GENERATE_ACT)
  async generateClosureDocument(
    invoice: IInvoice,
    customer: ICustomer,
  ): Promise<{ link: string; sum: number; total: number }> {
    this.logger.log(`Генеарция акта #${invoice.invoiceNumber}`);

    const globalSettings = await this.settingsRepository.globalSettings();
    const regionContacts = await this.regionRepository.regionContact(
      globalSettings.regionId,
    );
    const { settings, contract, systemSettings } =
      await this.settingsService.getCustomerSettings(customer.id);

    if (!settings)
      throw new BadRequestException('Настройки контракта не найдены');
    if (!systemSettings)
      throw new BadRequestException('Настройки систем контракта не найдены');

    const invoiceSum = this.getInvoiceSum(invoice.lines);
    const vat = 'vat' in settings ? settings.vat : globalSettings.vat || 0;
    const extendedLines = this.prepareLines(invoice.lines, vat);
    const invoiceVatSum = this.getInvoiceVatSum(extendedLines);
    const invoiceTotal = this.getInvoiceTotal(extendedLines);

    const image = readFileSync(
      join(
        process.cwd(),
        'documents',
        'sign',
        globalSettings.region.sign,
      ).replace(/\\/g, '/'),
      {
        encoding: 'base64',
      },
    );

    const vatString = this.getVatLabel(globalSettings.region.name, vat);
    const totalString = this.getInvoiceSumLabel(
      globalSettings.region.name,
      invoiceSum,
    );
    const templateName =
      globalSettings.region.name === RegionNames.KZ
        ? 'closure.kz.ejs'
        : 'closure.ejs';

    const template = await ejs.renderFile(
      join(__dirname, 'templates', templateName),
      {
        bill: invoice,
        contacts: regionContacts,
        customer,
        contract,
        lines: extendedLines,
        image,
        settingsVat: vat,
        total: {
          total: invoiceTotal,
          vat: invoiceVatSum,
          sum: invoiceSum,
          totalString,
          vatString,
        },
        today: new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    );

    const filename = `${invoice.invoiceNumber.replace('/', '-')}.pdf`;
    const pdfPath = join(process.cwd(), 'documents', 'acts', filename);
    const pdfOptions = {
      width: '595px',
      height: '842px',
      displayHeaderFooter: false,
      format: 'A4',
      path: pdfPath,
      margin: {
        top: '10px',
        bottom: '10px',
        left: '30px',
        right: '10px',
      },
    };
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: 'new',
    });
    const page = await browser.newPage();
    await page.setViewport({
      deviceScaleFactor: 1,
      width: 595,
      height: 842,
    });
    await page.goto(`data:text/html;charset=UTF-8,${template}`, {
      waitUntil: 'networkidle2',
    });
    await page.setContent(template);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await page.pdf(pdfOptions);
    await browser.close();
    this.logger.log('Сгенерирован акт для счета ' + filename);

    this.eventEmitter.emit(INVOICE_GENERATE_ACT_SUCCESS, invoice, filename);

    return {
      link: filename,
      total: invoiceTotal,
      sum: invoiceSum,
    };
  }
}
