import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Query,
  Response,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { stat } from 'fs/promises';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { DocumentsService } from './documents.service';
import { Public } from '../../common/decorators/public.decorator';
import { RegionsRepository } from '../regions/regions.repository';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInError } from '../auth/dtos/error.dto';
import { DocumentFilenameEntity } from './entity/document-filename.entity';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { DocumentEntity } from './entity/document.entity';
import { Response as Res } from 'express';

@ApiTags('DOCUMENT API')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly regionRepository: RegionsRepository,
  ) {}

  @Post('upload/contract')
  @ApiOperation({
    summary: 'Загрузка договора',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBearerAuth()
  @ApiOkResponse({ type: DocumentEntity })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'documents', 'contracts'),
        filename(
          req,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          callback(null, file.originalname);
        },
      }),
    }),
  )
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      comment: string;
      contractId: string;
    },
  ): Promise<DocumentEntity> {
    return this.documentsService.addDocumentToContract(body, file);
  }

  @Post('upload/sign')
  @ApiOperation({
    summary: 'Загрузка подписи для региона',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiOkResponse({ type: DocumentFilenameEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          title: 'Файл подписи',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'documents', 'sign'),
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          // Generating a 32 random chars long string
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  public async uploadSignFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('regionId') regionId: string,
    @AdminOnly() _perm: any,
  ): Promise<DocumentFilenameEntity> {
    await this.regionRepository.setSignFilename(
      parseInt(regionId),
      file.filename,
    );

    return {
      filename: file.filename,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Получение публичного файла',
  })
  @Get('public/:folder/:filename')
  @ApiParam({ name: 'folder', description: 'Папка' })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @ApiOkResponse({ type: StreamableFile })
  public async getPublicFile(@Param() params): Promise<StreamableFile> {
    const path = join(
      process.cwd(),
      'documents',
      params.folder,
      params.filename,
    );
    try {
      const file = createReadStream(path);
      return new StreamableFile(file);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  @Get('download/:folder/:filename')
  @ApiOperation({
    summary: 'Скачивание публичного файла',
  })
  @ApiParam({ name: 'folder', description: 'Папка' })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @ApiOkResponse({ type: StreamableFile })
  @Header('Content-Type', 'application/pdf')
  public async getFile(@Param() params: any): Promise<StreamableFile> {
    let folder = params.folder ?? '';
    if (folder.toLowerCase() === 'act') folder = 'acts';
    if (folder.toLowerCase() === 'bill') folder = 'bills';

    const path = join(process.cwd(), 'documents', folder, params.filename);
    try {
      const stats = await stat(path);
      if (!stats) throw new NotFoundException();
      const file = createReadStream(path);
      return new StreamableFile(file);
    } catch (err) {
      throw new BadRequestException();
    }
  }

  @Delete('/contracts')
  public async deleteContractFile(
    @AdminOnly() permission: any,
    @Query('id') id: string,
  ): Promise<void> {
    await this.documentsService.removeDocumentFromContract(id);
  }

  @Delete(':folder/:filename')
  @ApiOperation({
    summary: 'Удаление публичного файла',
  })
  @ApiParam({ name: 'folder', description: 'Папка' })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBearerAuth()
  public async deleteFile(
    @AdminOnly() permission,
    @Param() params,
  ): Promise<void> {
    await this.documentsService.deleteDocument(params.folder, params.filename);
  }
}
