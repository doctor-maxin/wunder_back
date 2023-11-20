import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Filters } from '../../common/types/Filters';
import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from '@prisma/client';
import { ChangeVisibilityDto } from './dto/change-visibility.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceWithAccountDto } from './dto/invoice-with-account.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { UploadInvoiceDocumentDto } from './dto/upload-invoice-document.dto';
import { InvoiceEntity } from './entity/invoice.entity';

@ApiTags('INVOICE API')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('/documents/upload')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Загрузить документ к платежу',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadInvoiceDocumentDto,
  })
  @ApiCreatedResponse()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          const rType = req.query.type.toString() ?? '';
          cb(null, join(process.cwd(), 'documents', rType.toLowerCase() + 's'));
        },
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          const filename = file.originalname.split('.');
          cb(null, file.originalname);
        },
      }),
    }),
  )
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadInvoiceDocumentDto,
  ) {
    await this.invoiceService.saveNewDocument({
      link: file.filename,
      name: body.name ? body.name : '',
      invoiceId: Number(body.invoiceId),
      type: body.type,
    });
  }
  //
  //     @Post("/bill/upload")
  //     @UseInterceptors(
  //         FileInterceptor("file", {
  //             storage: diskStorage({
  //                 destination: join(process.cwd(), "documents", "bills"),
  //                 filename: (req, file, cb) => {
  //                     file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
  //
  //                     const filename = file.originalname.split(".");
  //                     const ext = filename.pop();
  //                     cb(null, `${filename.join(".") + "-" + Date.now()}.${ext}`);
  //                 },
  //             }),
  //         })
  //     )
  //     async uploadBillFile(@UploadedFile() file: Express.Multer.File) {
  //         return file.filename;
  //     }
  //
  //     @Get("/acts")
  //     async getActsByCustomerId(
  //         @Query("customerId") customerId: string,
  //         @Query("filters") filtersString: string
  //     ) {
  //         const parsedCustomerId = parseInt(customerId);
  //         if (isNaN(parsedCustomerId)) {
  //             throw new BadRequestException();
  //         }
  //         const filters: Filters = JSON.parse(filtersString);
  //
  //         let params = {
  //             take: filters.limit,
  //             skip: filters.skip,
  //             where: {
  //                 customerId: parsedCustomerId,
  //                 OR: undefined,
  //                 contractId: undefined,
  //                 createdAt: undefined,
  //             },
  //             include: {
  //                 bill: {
  //                     include: {
  //                         lines: {
  //                             include: {
  //                                 account: {
  //                                     include: {
  //                                         system: true,
  //                                     },
  //                                 },
  //                             },
  //                         },
  //                     },
  //                 },
  //                 signedDocument: true,
  //             },
  //         };
  //         if (filters.query) {
  //             params.where.OR = [
  //                 { bill: { number: { contains: filters.query } } },
  //             ];
  //             if (!isNaN(parseFloat(filters.query))) params.where.OR.push({
  //                 total: { equals: parseFloat(filters.query) }
  //             })
  //         }
  //         if (filters.contract) {
  //             params.where.contractId = filters.contract;
  //         }
  //         if (filters.fromDate && filters.endDate) {
  //             const [d, m, y] = filters.endDate.split("-");
  //             const [d1, m1, y1] = filters.fromDate.split("-");
  //             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
  //             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
  //             params.where.createdAt = {
  //                 lte: endDate,
  //                 gte: fromDate,
  //             };
  //             console.log(params.where);
  //         } else if (filters.fromDate) {
  //             const [d1, m1, y1] = filters.fromDate.split("-");
  //             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
  //             params.where.createdAt = {
  //                 gte: fromDate,
  //             };
  //         } else if (filters.endDate) {
  //             const [d, m, y] = filters.fromDate.split("-");
  //             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
  //             params.where.createdAt = {
  //                 lte: endDate,
  //             };
  //         }
  //         return await this.billsService.getActs(params);
  //     }
  //
  //     @Get('/acts/report')
  //     async reportActs(@AdminOnly() permission: any, @Query("filters") filtersString: string) {
  //         const filters: Filters = JSON.parse(filtersString);
  //         return this.billsService.getActsReport(filters)
  //     }
  //
  //     @Get('/report')
  //     async reportBills(@AdminOnly() permission: any, @Query("filters") filtersString: string) {
  //         const filters: Filters = JSON.parse(filtersString);
  //         return this.billsService.getBillsReport(filters)
  //     }
  @Post('/acts')
  async generateAct(@Body('invoiceId') invoiceId: number) {
    return await this.invoiceService.generateAct(invoiceId);
  }

  @Get('/')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Получение платежей пользователем',
  })
  @ApiOkResponse({ type: [InvoiceWithAccountDto] })
  public async getAllByCustomerId(
    @Query('customerId') customerId: string,
    @Query('filters') filtersString?: string,
  ): Promise<[number, InvoiceWithAccountDto[]]> {
    const parsedCustomerId = parseInt(customerId);
    if (isNaN(parsedCustomerId)) {
      throw new BadRequestException('customerId is required');
    }
    if (!filtersString) throw new BadRequestException('filters is required');
    const filters: Filters = filtersString ? JSON.parse(filtersString) : {};

    return this.invoiceService.getInvoices(parsedCustomerId, filters);
  }

  @Get('/acts')
  public async getCustomerActs(
    @Query('customerId') customerId: string,
    @Query('filters') filtersString?: string,
  ): Promise<[number, InvoiceWithAccountDto[]]> {
    const parsedCustomerId = parseInt(customerId);
    if (isNaN(parsedCustomerId)) {
      throw new BadRequestException('customerId is required');
    }
    if (!filtersString) throw new BadRequestException('filters is required');
    const filters: Filters = filtersString ? JSON.parse(filtersString) : {};
    filters['status'] = InvoiceStatus.COMPLETED;
    return this.invoiceService.getInvoices(parsedCustomerId, filters);
  }

  @Put('/:id')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Обновить платеж',
  })
  @ApiOkResponse({ type: InvoiceEntity })
  public async updateInvoice(@Body() invoice: UpdateInvoiceDto) {
    return await this.invoiceService.updateInvoice(invoice);
  }

  @Put('/acts/:id/visibility')
  async changeActVisibility(@Body() data: ChangeVisibilityDto) {
    return this.invoiceService.changeActVisibility(data);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Удалить платеж',
  })
  @ApiOkResponse()
  public async deleteInvoice(@Param('id') id: string) {
    console.log('delete invoice', id);
    await this.invoiceService.deleteInvoice(id);
  }
}
