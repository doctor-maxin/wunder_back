import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import {
  DocumentTypes,
  SignKey,
  SignRequest,
  SignResponse,
} from './edin.types';
import { readFileSync } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EdinService {
  edinUrl: string;
  edinPassword: string;
  edinEmail: string;

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {
    this.edinUrl = process.env.EDIN_URL;
    this.edinEmail = process.env.EDIN_EMAIL;
    this.edinPassword = process.env.EDIN_PASS;
  }

  async reSendWaitingDocuments() {
    try {
      const keys = await this.getKeys();

      // if (keys.find((k) => k.sessionOpened)) {
      //     const docs = await this.prisma.signedDocuments.findMany({
      //         where: { status: "WAITING" },
      //     });
      //     if (docs && docs.length) {
      //         for (const doc of docs) {
      //             const content = await this.readFileAndSign(
      //                 join("acts", doc.fileLink)
      //             );
      //             if (typeof content === "string") {
      //                 const pathname = join(
      //                     process.cwd(),
      //                     "edin",
      //                     doc.fileLink
      //                 );
      //                 await writeFile(pathname, content, "base64");
      //                 await this.prisma.signedDocuments.update({
      //                     where: { id: doc.id },
      //                     data: { status: "SIGNED" },
      //                 });
      //                 await this.prisma.acts.update({
      //                     where: {
      //                         id: doc.actId,
      //                     },
      //                     data: {
      //                         isSigned: true,
      //                         closed: true,
      //                     },
      //                 });
      //             }
      //         }
      //     }
      // } else throw new BadRequestException("NO_ACTIVE_KEYS");
    } catch (e) {
      console.log('Wailed reSend waiting documents', e);
    }
  }

  async readFileAndSign(pathname: string) {
    const file = readFileSync(join(process.cwd(), 'documents', pathname));
    const keys = await this.getKeys();
    const key = keys.find((k) => k.sessionOpened);
    if (!key) throw new BadRequestException('NO_ACTIVE_KEYS');
    const content = new Buffer(file).toString('base64');
    return await this.signFile(content, key.id);
  }

  async getKeys() {
    const { data } = await this.httpService.axiosRef.get<SignKey[]>(
      `${this.edinUrl}/sign/cloud/keys`,
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.edinEmail}:${this.edinPassword}`).toString(
              'base64',
            ),
        },
      },
    );
    return data;
  }

  async signFile(content: string, keyId: string) {
    try {
      const signPayload: SignRequest = {
        content,
        keyId,
        description: 'Ручная подпись',
        documentType: DocumentTypes.PDF,
      };
      const { data } = await this.httpService.axiosRef.post<SignResponse>(
        `${this.edinUrl}/sign/cloud`,
        signPayload,
        {
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(`${this.edinEmail}:${this.edinPassword}`).toString(
                'base64',
              ),
          },
        },
      );
      return data.container;
    } catch (err) {
      console.error(err.response.data);
      return err;
    }
  }
}
