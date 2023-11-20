import { Injectable } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { InvoiceWithAccountDto } from '../dto/invoice-with-account.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { InvoiceRatesEntity } from '../entity/invoice-rates.entity';
import {
  IInvoice,
  IInvoiceLine,
  InvoiceEntity,
} from '../entity/invoice.entity';

@Injectable()
export class InvoiceRepository {
  constructor(private prisma: PrismaService) {}

  public async getByTaskId(id: number): Promise<IInvoice> {
    return this.prisma.invoice.findFirst({
      where: {
        taskId: id,
      },
    }) as unknown as IInvoice;
  }

  public async getById(id: number): Promise<IInvoice> {
    return this.prisma.invoice.findUnique({
      where: {
        id,
      },
      include: {
        task: true,
        invoiceDocument: true,
      },
    }) as unknown as IInvoice;
  }

  public async setVisibility(id: number, visibility: boolean) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        isVisible: visibility,
      },
    });
  }

  public async updateInvoice(
    id: number,
    payload: Omit<UpdateInvoiceDto, 'id' | 'rates'>,
  ): Promise<InvoiceEntity> {
    return this.prisma.invoice.update({
      where: { id },
      // @ts-ignore
      data: payload,
    }) as unknown as InvoiceEntity;
  }

  public async updateInvoiceRates(
    invoiceId: number,
    data: Pick<InvoiceRatesEntity, 'rubRate' | 'usdRate' | 'eurRate'>,
  ): Promise<InvoiceRatesEntity> {
    if ('id' in data) {
      return this.prisma.invoiceRates.update({
        where: { invoiceId },
        data: {
          eurRate: data.eurRate?.toString() ?? '',
          rubRate: data.rubRate?.toString() ?? '',
          usdRate: data.usdRate?.toString() ?? '',
        },
      });
    }
    return this.prisma.invoiceRates.create({
      data: {
        eurRate: data.eurRate?.toString() ?? '',
        rubRate: data.rubRate?.toString() ?? '',
        usdRate: data.usdRate?.toString() ?? '',
        invoiceId,
      },
    });
  }

  public async getTotalCount(where: Prisma.InvoiceWhereInput): Promise<number> {
    return this.prisma.invoice.count({ where });
  }

  public async find(
    filters: Prisma.InvoiceFindManyArgs,
  ): Promise<InvoiceWithAccountDto[]> {
    const invoices = await this.prisma.invoice.findMany({
      ...filters,
      include: {
        invoiceDocument: true,
        rates: true,
      },
    });
    const list = [];
    for (const invoice of invoices) {
      const lines = invoice.lines as unknown as IInvoiceLine[];
      for (const line of lines) {
        line.amount = line.accounts.reduce((acc, cur) => acc + cur.sum, 0);
        for (const account of line.accounts) {
          const acc = await this.prisma.account.findUnique({
            where: {
              id: account.id,
            },
            select: {
              accountName: true,
            },
          });
          if (acc) account.name = acc.accountName;
        }
      }

      list.push({
        ...invoice,
        lines,
      });
    }
    return list;
    // return Promise.all(
    //     invoices.map(async (invoice) => {
    //         let invoiceLines: IInvoiceLine[] = Array.isArray(invoice.lines)
    //             ? (invoice.lines as unknown as IInvoiceLine[])
    //             : [];
    //         const lines = await Promise.all(
    //             invoiceLines.map(async (line) => {
    //                 const account = await this.prisma.account.findUnique({
    //                     where: { id: line.accountId },
    //                 });

    //                 return {
    //                     ...line,
    //                     account,
    //                 };
    //             })
    //         );
    //         return {
    //             ...invoice,
    //             lines,
    //         };
    //     })
    // );
  }

  public async createInvoice(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({ data });
  }

  public async bindTaskId(invoiceId: number, taskId: number) {
    return this.prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        task: {
          connect: {
            id: taskId,
          },
        },
      },
    });
  }

  public async setStatus(id: number, status: InvoiceStatus): Promise<void> {
    await this.prisma.invoice.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  public async removeInvoice(id: number): Promise<void> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: {
          id,
        },
      });
      if (invoice) {
        await Promise.allSettled([
          this.prisma.invoiceDocument.deleteMany({
            where: {
              invoiceId: id,
            },
          }),
          this.prisma.invoiceRates.delete({
            where: {
              invoiceId: id,
            },
          }),
          this.prisma.task.deleteMany({
            where: {
              invoiceId: id,
            },
          }),
        ]);
        await this.prisma.invoice.delete({
          where: {
            id,
          },
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  }
}
