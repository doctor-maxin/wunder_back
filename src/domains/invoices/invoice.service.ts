import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IInvoice,
  IInvoiceDocument,
  IInvoiceLine,
  InvoiceEntity,
} from './entity/invoice.entity';
import { InvoiceDocumentType, InvoiceStatus, Prisma } from '@prisma/client';
import { InvoiceRepository } from './repositories/invoice.repository';
import { InvoiceDocumentRepository } from './repositories/invoice-document.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Filters } from '../../common/types/Filters';
import { ChangeVisibilityDto } from './dto/change-visibility.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceRatesEntity } from './entity/invoice-rates.entity';
import { CustomerRepository } from '../users/repositories/customer.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  INVOICE_GENERATE_ACT,
  INVOICE_GENERATE_ACT_SUCCESS,
} from '../../common/events/events';
import { ICustomer } from '../../common/interfaces/user.interface';
import { InvoiceWithAccountDto } from './dto/invoice-with-account.dto';
// import {PrismaService} from "../prisma/prisma.service";
// import {
//   Acts,
//   Bill,
//   BillLine,
//   Customer,
//   CustomerToSystemSettings,
//   Prisma,
//   Settings,
//   SignedDocumentsStatus,
//   SysemSettingsCustomerLine,
//   Task
// } from "@prisma/client";
// import {PdfService} from "src/helpers/pdf.service";
// import {TaskType} from "../common/types/taskType.enum";
// import {SystemSettingsRepository} from "../settings/entities/system-settings.repository";
// import * as moment from "moment/moment";
// import {PlanFixService} from "../plan-fix/plan-fix.service";
// import {Filters} from "../common/types/Filters";
// import {BillsRepository} from "./bills.repository";
// import {MailService} from "../mail/mail.service";
// import {RegionsRepository} from "../modules/regions/regions.repository";
//
// type PreparedBillLines = {
//   system: string;
//   sum: number;
//   accountId: number;
// }
// type BillWithLines = Bill & { lines: BillLine[] }
//
@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceDocumentRepository: InvoiceDocumentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async createInvoice(payload: CreateInvoiceDto): Promise<IInvoice> {
    const generatedBillNumber = await this.generateBillNumber();
    const invoice = await this.invoiceRepository.createInvoice({
      invoiceNumber: generatedBillNumber,
      contractId: payload.contractId,
      customer: {
        connect: {
          id: payload.customerId,
        },
      },
      status: InvoiceStatus.NEW,
      isVisible: false,
      currency: payload.currency,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      lines: payload.lines as Prisma.JsonArray,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cachedSystemSettings: payload.systemSettings.map((ss) => ({
        lines: ss.lines,
        minSum: ss.minSum,
        currency: ss.currency,
        systemName: ss.systemName,
      })) as Prisma.JsonArray,
    });
    const document = await this.invoiceDocumentRepository.createBillDocument(
      invoice.id,
    );
    const lines: IInvoiceLine[] = Array.isArray(invoice.lines)
      ? (invoice.lines as unknown as IInvoiceLine[])
      : [];
    const systemSettings = Array.isArray(invoice.cachedSystemSettings)
      ? invoice.cachedSystemSettings
      : [];

    return {
      ...invoice,
      lines: lines,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cachedSystemSettings: systemSettings,
      invoiceDocument: [document],
    };
  }

  private async generateBillNumber(): Promise<string> {
    const year = new Date();
    year.setMonth(0);
    year.setDate(1);
    const nextYear = new Date();
    nextYear.setFullYear(year.getFullYear() + 1);
    const allInvoices = await this.invoiceRepository.getTotalCount({
      createdAt: {
        gte: year,
        lte: nextYear,
      },
    });
    return `${allInvoices + 1}/${year.getFullYear()}`;
  }

  public getInvoiceDocument(invoice: IInvoice): IInvoiceDocument | null {
    if (invoice.invoiceDocument.length === 0) return null;

    switch (invoice.status) {
      case InvoiceStatus.NEW:
        return (
          invoice.invoiceDocument.find(
            (doc) => doc.type === InvoiceDocumentType.BILL,
          ) || null
        );
      case InvoiceStatus.WAITING:
        return (
          invoice.invoiceDocument.find(
            (doc) => doc.type === InvoiceDocumentType.SIGNED_BILL,
          ) || null
        );
      case InvoiceStatus.PAID:
        return (
          invoice.invoiceDocument.find(
            (doc) => doc.type === InvoiceDocumentType.ACT,
          ) || null
        );
      case InvoiceStatus.SIGNED:
        return (
          invoice.invoiceDocument.find(
            (doc) => doc.type === InvoiceDocumentType.SIGNED_ACT,
          ) || null
        );
    }
  }

  public async getInvoices(
    customerId: number,
    filters: Filters,
  ): Promise<[number, InvoiceWithAccountDto[]]> {
    const params: any = {
      take: filters.limit ? filters.limit : 10,
      skip: filters.skip ? filters.skip : 0,
      where: {
        customerId,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    };
    if (filters.status) {
      params.where.status = filters.status;
    }
    if (filters.isVisible) {
      params.where.isVisible = true;
    }

    if (filters.query) {
      params.where['OR'] = [{ invoiceNumber: { contains: filters.query } }];
    }
    if (filters.contract) {
      params.where['contractId'] = filters.contract;
    }

    if (filters.fromDate && filters.endDate) {
      const [y, m, d] = filters.endDate.split('-');
      const [y1, m1, d1] = filters.fromDate.split('-');
      const endDate = new Date(Number(y), Number(m) - 1, Number(d));
      const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
      params.where.createdAt = {
        lte: endDate,
        gte: fromDate,
      };
      console.log(params.where);
    } else if (filters.fromDate) {
      const [y1, m1, d1] = filters.fromDate.split('-');
      const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
      params.where.createdAt = {
        gte: fromDate,
      };
    } else if (filters.endDate) {
      const [y, m, d] = filters.endDate.split('-');
      const endDate = new Date(Number(y), Number(m) - 1, Number(d));

      params.where.createdAt = {
        lte: endDate,
      };
    }

    return Promise.all([
      this.invoiceRepository.getTotalCount(params.where),
      this.invoiceRepository.find(params),
    ]);
  }

  async saveNewDocument(payload: Omit<IInvoiceDocument, 'id'>): Promise<void> {
    await this.invoiceDocumentRepository.updateDocument(payload);
  }

  //   async createExpensesWaitingTasks(
  //       globalSettings: Settings,
  //       bill: Bill,
  //       customer: Customer,
  //       settings: Settings,
  //       parentTask: Task
  //   ) {
  //     const paymentWaitingTaskId = (
  //         await this.planFixService.createPaymentWaitingTask(
  //             customer.companyName,
  //             globalSettings.planFixManagerId,
  //             bill.number,
  //             customer.planFixId,
  //             settings.projectId,
  //             parentTask.id,
  //             bill.link
  //         )
  //     ).data.id;
  //
  //     const waitingExpireDate = moment()
  //         .add(settings.paymentWaitingHours, "hours")
  //         .toDate();
  //     await this.prisma.paymentWaiting.create({
  //       data: {
  //         task: {
  //           create: {
  //             id: paymentWaitingTaskId,
  //             counterparty: {
  //               connect: {
  //                 id: customer.id,
  //               },
  //             },
  //             billId: bill.id,
  //             'type': TaskType.PAYMENT_WAITING_EXPENSES,
  //             managerId: globalSettings.planFixManagerId,
  //             parentId: parentTask.id,
  //           },
  //         },
  //         isActive: true,
  //         expireDate: waitingExpireDate,
  //       },
  //     })
  //     const billLink = `${process.env.FRONTEND_HOST}/download/?document=bills&name=${bill.link}`;
  //
  //     await this.mailService.sendBill(
  //         customer.contactEmail,
  //         billLink
  //     );
  //     await this.mailService.sendBill(
  //         customer.companyEmail,
  //         billLink
  //     );
  //   }
  //
  //   async getBillsReport(filters: Filters) {
  //     const include: Prisma.BillInclude = {
  //       act: true,
  //       lines: {
  //         include: {
  //           account: {
  //             include: {
  //               system: true
  //             }
  //           }
  //         }
  //       },
  //       systemLines: true,
  //       customer: {
  //         select: {
  //           companyName: true
  //         }
  //       },
  //       contract: {
  //         select: {
  //           settings: {
  //             select: {
  //               payType: true
  //             }
  //           },
  //           contractType: true,
  //           contractService: true
  //         }
  //       }
  //     }
  //     const list = await this.repository.bills({take: filters.limit, skip: filters.skip, include: include})
  //     const total = await this.prisma.bill.count()
  //     return [list, total]
  //   }
  //
  public async changeActVisibility(data: ChangeVisibilityDto) {
    return this.invoiceRepository.setVisibility(data.id, data.visibility);
  }

  //   async getActsReport(filters: Filters) {
  //     const where: Prisma.ActsWhereInput = {}
  //
  //     if (filters.fromDate && filters.endDate) {
  //       where.createdAt = {
  //         lte: new Date(filters.endDate),
  //         gte: new Date(filters.fromDate),
  //       };
  //     } else if (filters.fromDate) {
  //       where.createdAt = {
  //         gte: new Date(filters.fromDate),
  //       };
  //     } else if (filters.endDate) {
  //       where.createdAt = {
  //         lte: new Date(filters.endDate),
  //       };
  //     }
  //
  //     return this.getActs({
  //       where, take: filters.limit, skip: filters.skip, include: {
  //         customer: {
  //           select: {
  //             companyName: true
  //           }
  //         },
  //         bill: {
  //           include: {
  //             contract: {
  //               select: {
  //                 contractService: true,
  //               }
  //             }
  //           }
  //         }
  //       }
  //     })
  //   }
  //
  //   async createBillLines(lines: PreparedBillLines[], customer: Customer, contractId: number, bill: Bill) {
  //     const systemSettings = await this.systemSettingsRepository.customerSystemSettings({
  //       where: {contractId},
  //       include: {
  //         lines: true
  //       }
  //     })
  //     const billLinesSettings = []
  //
  //     systemSettings
  //         .filter((ss: CustomerToSystemSettings & {
  //               lines: SysemSettingsCustomerLine[];
  //             }) => ss.lines && ss.lines.length
  //         )
  //         .map(
  //             (
  //                 ss: CustomerToSystemSettings & {
  //                   lines: SysemSettingsCustomerLine[];
  //                 }
  //             ) => {
  //               ss.lines.map((line) =>
  //                   billLinesSettings.push({
  //                     discount: line.discount,
  //                     fromAmount: line.fromAmount,
  //                     toAmount: line.toAmount,
  //                     commission: line.commission,
  //                     systemName: ss.systemName,
  //                     bill: {
  //                       connect: {
  //                         id: bill.id,
  //                       },
  //                     },
  //                   })
  //               );
  //               return ss.lines;
  //             }
  //         );
  //
  //     await this.prisma.$transaction(
  //         billLinesSettings.map((line) =>
  //             this.prisma.billSystemLine.create({data: line})
  //         )
  //     );
  //
  //     const billLines = lines.filter(line => line.accountId).map(line => ({
  //       sum: line.sum,
  //       billId: bill.id,
  //       accountId: line.accountId,
  //     }))
  //     return this.prisma.billLine.createMany({data: billLines})
  //   }
  //
  //   async getActs(params: {
  //     skip?: number;
  //     take?: number;
  //     where?: Prisma.ActsWhereInput;
  //     include?: Prisma.ActsInclude;
  //   }): Promise<any> {
  //     const { skip, take, where, include } = params;
  //     return this.prisma.$transaction([
  //       this.prisma.acts.count({ where }),
  //       this.prisma.acts.findMany({
  //         skip,
  //         take,
  //         where,
  //         include,
  //       }),
  //     ]);
  //   }

  //
  async generateAct(invoiceId: number) {
    const invoice = await this.invoiceRepository.getById(invoiceId);
    if (!invoiceId) throw new BadRequestException('Платеж не найден ');
    if (
      [
        InvoiceStatus.AVOIDED,
        InvoiceStatus.SIGNED,
        InvoiceStatus.COMPLETED,
        InvoiceStatus.CANCELED,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
      ].includes(invoice.status)
    )
      throw new BadRequestException('Некорректный статус платежа ');
    const customer = await this.customerRepository.findById<ICustomer>(
      invoice.customerId,
    );
    this.eventEmitter.emit(INVOICE_GENERATE_ACT, invoice, customer);
  }

  @OnEvent(INVOICE_GENERATE_ACT_SUCCESS)
  public async actGenerated(invoice: IInvoice, link: string) {
    await this.invoiceDocumentRepository.createActDocument(invoice.id, {
      link,
    });
  }

  public async updateInvoice(
    data: UpdateInvoiceDto,
  ): Promise<InvoiceEntity & { rates?: InvoiceRatesEntity }> {
    const payload: any = {};
    if (data.status) payload.status = data.status;
    if (data.lines) payload.lines = data.lines;
    if (data.invoiceNumber) payload.invoiceNumber = data.invoiceNumber;
    if (data.currency) payload.currency = data.currency;
    if ('isVisible' in data) payload.isVisible = data.isVisible;
    if ('hasOriginal' in data) payload.hasOriginal = data.hasOriginal;

    // Update invoice
    const document = await this.invoiceRepository.updateInvoice(
      data.id,
      payload,
    );
    // Update invoice documents
    if (data.invoiceDocument?.length) {
      const localDocuments =
        await this.invoiceDocumentRepository.getInvoiceDocuments(data.id);
      for (const doc of localDocuments) {
        const oldDoc = data.invoiceDocument.find((item) => item.id === doc.id);

        if (oldDoc) {
          await this.invoiceDocumentRepository.setDocumentNameAndType(
            doc.id,
            oldDoc.name,
            oldDoc.type,
          );
        }
      }
      document['invoiceDocument'] =
        (await this.invoiceDocumentRepository.getInvoiceDocuments(data.id)) ??
        [];
      console.log(
        'new invoices',
        await this.invoiceDocumentRepository.getInvoiceDocuments(data.id),
      );
    }
    // Update invoice rates
    if (data.rates?.eurRate)
      document['rates'] = await this.invoiceRepository.updateInvoiceRates(
        data.id,
        data.rates,
      );
    return document;
  }

  //   async updateBill(bill: BillWithLines): Promise<Bill> {
  //     if (bill.lines && bill.lines.length) {
  //       await this.prisma.$transaction(bill.lines.map(line =>
  //           this.prisma.billLine.update({
  //             where: {id: line.id},
  //             data: {
  //               expense: line.expense,
  //               sum: line.sum,
  //               transfered: line.transfered
  //             }
  //           })))
  //     }
  //     return this.prisma.bill.update({
  //       where: {id: bill.id},
  //       data: {
  //         number: bill.number,
  //         paid: bill.paid,
  //         link: bill.link,
  //         usdRate: bill.usdRate || 1,
  //         rubRate: bill.rubRate || 1,
  //         eurRate: bill.eurRate || 1,
  //       },
  //       include: {
  //         lines: {
  //           include: {
  //             account: {
  //               select: {
  //                 system: true
  //               }
  //             }
  //           }
  //         },
  //       },
  //     });
  //   }
  //   async updateAct(act: any): Promise<Acts> {
  //     if (act.signedfile) {
  //       console.log(act)
  //       if (act.id) {
  //         await this.prisma.signedDocuments.update({
  //           where: {actId: act.id},
  //           data: {
  //             fileLink: act.signedfile,
  //             status: SignedDocumentsStatus.SIGNED
  //           },
  //         })
  //
  //       } else {
  //         const params = {
  //           status: SignedDocumentsStatus.SIGNED,
  //           act: {connect: {id: act.id}},
  //           fileLink: act.signedfile,
  //           customerId: act.customerId,
  //           task: {
  //             connect: {
  //               id: act.bill.taskId
  //             }
  //           }
  //         }
  //         await this.prisma.signedDocuments.create({data: params})
  //       }
  //     }
  //     let data: any = {
  //       hasOriginal: act.hasOriginal,
  //       closed: act.closed,
  //       isSigned: act.isSigned,
  //       link: act.link,
  //       isVisible: act.isVisible,
  //     };
  //     if (act.billId !== act.bill.id) {
  //       data.bill = {
  //         connect: {
  //           id: act.billId,
  //         },
  //       };
  //     }
  //
  //     return this.prisma.acts.update({
  //       where: {id: act.id},
  //       data,
  //       include: {
  //         bill: {
  //           include: {
  //             lines: true,
  //           },
  //         },
  //         signedDocument: true
  //       },
  //     });
  //   }
  //
  //   async deleteAct(id: string) {
  //     await this.prisma.signedDocuments.deleteMany({where: {actId: parseInt(id)}})
  //     return this.prisma.acts.delete({where: {id: parseInt(id)}});
  //   }
  public async deleteInvoice(id: string): Promise<void> {
    const billId = parseInt(id);
    await this.invoiceRepository.removeInvoice(billId);
    // await this.invoiceRepository.setStatus(billId, InvoiceStatus.AVOIDED);
  }
}
