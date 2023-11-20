import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InvoiceDocumentType } from '@prisma/client';
import { IInvoiceDocument } from '../entity/invoice.entity';

@Injectable()
export class InvoiceDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async removeInvoiceDocument(id: number): Promise<void> {
    await this.prisma.invoiceDocument.delete({
      where: {
        id,
      },
    });
  }

  public async getBillDocument(invoiceId: number): Promise<IInvoiceDocument> {
    return this.prisma.invoiceDocument.findFirst({
      where: {
        invoiceId,
        type: 'BILL',
      },
    });
  }

  public async getActDocument(invoiceId: number): Promise<IInvoiceDocument> {
    return this.prisma.invoiceDocument.findFirst({
      where: {
        invoiceId,
        type: 'ACT',
      },
    });
  }

  public async getInvoiceDocuments(id: number): Promise<IInvoiceDocument[]> {
    return this.prisma.invoiceDocument.findMany({
      where: {
        invoiceId: id,
      },
    });
  }

  public async setDocumentNameAndType(
    id: number,
    name: string,
    type: IInvoiceDocument['type'],
  ): Promise<void> {
    await this.prisma.invoiceDocument.update({
      where: {
        id,
      },
      data: {
        name,
        type,
      },
    });
  }

  public async updateDocument(payload: Omit<IInvoiceDocument, 'id'>) {
    await this.prisma.invoiceDocument.deleteMany({
      where: {
        invoiceId: payload.invoiceId,
        type: payload.type,
      },
    });
    return this.prisma.invoiceDocument.create({
      data: {
        link: payload.link,
        name: payload.name,
        type: payload.type,
        invoice: {
          connect: {
            id: payload.invoiceId,
          },
        },
      },
    });
  }
  public async setBillDocument(id: number, link: string) {
    const hasDoc = await this.prisma.invoiceDocument.findFirst({
      where: {
        type: 'BILL',
        invoiceId: id,
      },
    });
    if (hasDoc) {
      return this.prisma.invoiceDocument.update({
        where: {
          id: hasDoc.id,
        },
        data: {
          link,
        },
      });
    } else {
      return this.prisma.invoiceDocument.create({
        data: {
          name: '',
          link,
          type: 'BILL',
          invoiceId: id,
        },
      });
    }
  }

  public async createBillDocument(
    invoiceId: number,
    data?: { link?: string; name?: string },
  ) {
    return this.prisma.invoiceDocument.create({
      data: {
        invoice: {
          connect: {
            id: invoiceId,
          },
        },
        link: data?.link ?? '',
        name: data?.name ?? '',
        type: InvoiceDocumentType.BILL,
      },
    });
  }

  public async createBillSignedDocument(
    invoiceId: number,
    data?: { link?: string; name?: string },
  ) {
    return this.prisma.invoiceDocument.create({
      data: {
        invoice: {
          connect: {
            id: invoiceId,
          },
        },
        link: data?.link ?? '',
        name: data?.name ?? '',
        type: InvoiceDocumentType.SIGNED_BILL,
      },
    });
  }

  public async createActDocument(
    invoiceId: number,
    data?: { link?: string; name?: string },
  ) {
    return this.prisma.invoiceDocument.create({
      data: {
        invoice: {
          connect: {
            id: invoiceId,
          },
        },
        link: data?.link ?? '',
        name: data?.name ?? '',
        type: InvoiceDocumentType.ACT,
      },
    });
  }

  public async createActSignedDocument(
    invoiceId: number,
    data?: { link?: string; name?: string },
  ) {
    return this.prisma.invoiceDocument.create({
      data: {
        invoice: {
          connect: {
            id: invoiceId,
          },
        },
        link: data?.link ?? '',
        name: data?.name ?? '',
        type: InvoiceDocumentType.SIGNED_ACT,
      },
    });
  }
}
