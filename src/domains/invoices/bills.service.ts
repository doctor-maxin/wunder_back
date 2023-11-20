import { Injectable } from '@nestjs/common';
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
  //   constructor(private prisma: PrismaService, private pdfService: PdfService,
  //               private planFixService: PlanFixService,
  //               private repository: BillsRepository,
  //               private systemSettingsRepository: SystemSettingsRepository,
  //               private mailService: MailService,
  //               private regionRepository: RegionsRepository
  //   ) {
  //   }
  //
  //   async getAll(params: {
  //     skip?: number;
  //     take?: number;
  //     where?: Prisma.BillWhereInput;
  //     include?: Prisma.BillInclude;
  //   }): Promise<[number, Bill[]]> {
  //     const { skip, take, where, include } = params;
  //
  //     return this.prisma.$transaction([
  //       this.prisma.bill.count({ where }),
  //       this.prisma.bill.findMany({
  //         skip,
  //         take,
  //         where,
  //         include,
  //       }),
  //     ]);
  //   }
  //
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
  //   async changeActVisibility(data) {
  //     return this.prisma.acts.update({
  //       where: {id: data.actId},
  //       data: {isVisible: data.value}
  //     })
  //   }
  //
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
  //   async createBill({customer, globalSettings, task, documentName, contractId, payType}: {
  //     customer: Customer,
  //     globalSettings: Settings,
  //     task: Task,
  //     documentName: string;
  //     contractId: number;
  //     payType: string;
  //   }) {
  //     console.log('task', task)
  //     const generatedBillNumber = await this.generateBillNumber(customer.id)
  //     const payload: Prisma.BillCreateInput = {
  //       task: {
  //         connectOrCreate: {
  //           create: {
  //             id: task.id,
  //             counterparty: {
  //               connect: {
  //                 id: customer.id
  //               }
  //             },
  //             managerId: globalSettings.planFixManagerId,
  //             type: TaskType.TOP_UP_ACCOUNTS
  //           },
  //           where: {
  //             id: task.id
  //           }
  //         }
  //       }, number: generatedBillNumber,
  //       link: documentName,
  //       readyForPay: true,
  //       'type': payType,
  //       contract: {connect: {id: contractId}},
  //       customer: {
  //         connect: {
  //           id: customer.id
  //         }
  //       }
  //     }
  //     return this.prisma.bill.create({
  //       data: payload
  //     })
  //   }
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
  //   async generateBillNumber(id: number): Promise<string> {
  //     const year = new Date();
  //     year.setMonth(0);
  //     year.setDate(1);
  //     const nextYear = new Date();
  //     nextYear.setFullYear(year.getFullYear() + 1);
  //     const allBills = await this.prisma.bill.count({
  //       where: {
  //         createdAt: {
  //           gte: year,
  //           lte: nextYear,
  //         },
  //       },
  //     });
  //     return `${allBills + 1}/${year.getFullYear()}`;
  //   }
  //
  //   async generateAct(bill: Bill) {
  //     const extendedBill = await this.prisma.bill.findUnique({
  //       where: { id: bill.id },
  //       include: {
  //         contract: {
  //           include: {
  //             systemSettings: {
  //               include: {
  //                 lines: true,
  //               },
  //             },
  //             settings: true,
  //           }
  //         },
  //         lines: {
  //           include: {
  //             account: {
  //               include: {
  //                 system: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //
  //     const customer = await this.prisma.customer.findUnique({
  //       where: { id: bill.customerId },
  //     });
  //
  //     const region = await this.regionRepository.activeRegion()
  //     const contacts = await this.regionRepository.regionContact(region.id)
  //     const contract = extendedBill.contract
  //
  //     const {total, sum, link} = await this.pdfService.generateClosureDocument({
  //       bill: extendedBill,
  //       contacts,
  //       customer,
  //       contract,
  //       sign: region.sign,
  //       regionName: region.name
  //     });
  //
  //     console.log("Closure document", link);
  //     return this.prisma.acts.create({
  //       data: {
  //         link,
  //         total,
  //         sum,
  //         bill: {
  //           connect: {
  //             id: bill.id,
  //           },
  //         },
  //         contract: {connect: {id: contract.id}},
  //         customer: {
  //           connect: {
  //             id: customer.id,
  //           },
  //         },
  //       },
  //       include: {
  //         bill: true,
  //       },
  //     });
  //   }
  //
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
  //   async deleteBill(id: string) {
  //     let billId = parseInt(id)
  //     try {
  //       await Promise.all([
  //         this.prisma.acts.deleteMany({where: {billId}}),
  //         this.prisma.billSystemLine.deleteMany({where: {billId}}),
  //         this.prisma.billLine.deleteMany({where: {billId}}),
  //         this.prisma.task.deleteMany({where: {billId}})
  //       ])
  //
  //       return this.prisma.bill.delete({where: {id: parseInt(id)}});
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }
}
