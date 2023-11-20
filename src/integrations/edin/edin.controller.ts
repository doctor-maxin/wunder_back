import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { readFile, writeFile } from 'fs/promises';
import { diskStorage } from 'multer';
import { join } from 'path';
import { EdinService } from './edin.service';
import { readFileSync } from 'fs';

@Controller('edin')
export class EdinController {
  constructor(private edinService: EdinService) {}

  @Post('sign')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'documents', 'edin'),
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          const filename = file.originalname.split('.');
          const ext = filename.pop();
          cb(null, `${filename.join('.') + '-' + Date.now()}.${ext}`);
        },
      }),
    }),
  )
  async signFile(@UploadedFile() file: Express.Multer.File) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      let content: string = readFileSync(file.path);
      content = new Buffer(content).toString('base64');
      const keys = await this.edinService.getKeys();
      const key = keys.find((k) => k.sessionOpened);
      if (!key) throw new BadRequestException('NO_ACTIVE_KEYS');
      const data = await this.edinService.signFile(content, key.id);
      await writeFile(
        join(process.cwd(), 'documents', 'edin', file.filename),
        data,
        { encoding: 'base64' },
      );
      return {
        data,
        filename: file.filename,
      };
    } catch (e) {
      console.log(e.response);
      return new BadRequestException(e);
    }
  }
}
