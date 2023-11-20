import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertDocumentDto } from './dto/document-upsert.dto';
import { DocumentEntity } from './entity/document.entity';
import { stat, unlink } from 'fs/promises';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createDocument(
    contractId: number,
    doc: UpsertDocumentDto,
  ): Promise<DocumentEntity> {
    return this.prisma.document.create({
      data: {
        comment: doc.comment,
        link: doc.link,
        name: doc.name,
        contract: {
          connect: { id: contractId },
        },
      },
    });
  }

  public async deleteDocument(id: number): Promise<void> {
    const doc = await this.prisma.document.delete({
      where: {
        id,
      },
    });
    const hasFile = await stat(doc.link);
    if (hasFile) {
      await unlink(doc.link);
    }
  }

  public async upsertDocuments(
    contractId: number,
    list: UpsertDocumentDto[],
  ): Promise<DocumentEntity[]> {
    return this.prisma.$transaction(
      list.map((doc) =>
        doc.id
          ? this.prisma.document.update({
              where: { id: doc.id },
              data: {
                comment: doc.comment,
                link: doc.link,
                name: doc.name,
              },
            })
          : this.prisma.document.create({
              data: {
                comment: doc.comment,
                link: doc.link,
                name: doc.name,
                contract: {
                  connect: { id: contractId },
                },
              },
            }),
      ),
    );
  }
}
