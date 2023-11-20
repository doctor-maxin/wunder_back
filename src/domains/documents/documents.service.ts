import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentRepository } from './document.repository';
import { DocumentEntity } from './entity/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async deleteDocument(folder: string, filename: string) {
    const fs = require('fs');
    try {
      fs.unlinkSync(join(process.cwd(), 'documents', folder, filename));
    } catch (err) {
      console.error(err);
    }

    await this.prisma.document.deleteMany({
      where: { link: filename },
    });
  }

  public async addDocumentToContract(
    data: {
      contractId: string;
      comment?: string;
    },
    file: Express.Multer.File,
  ): Promise<DocumentEntity> {
    const document = this.documentRepository.createDocument(
      Number(data.contractId),
      {
        link: file.path,
        comment: data.comment,
        contractId: Number(data.contractId),
        name: file.filename,
      },
    );
    return document;
  }

  public async removeDocumentFromContract(id: string) {
    await this.documentRepository.deleteDocument(Number(id));
  }
}
