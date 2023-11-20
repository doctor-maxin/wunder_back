import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceDocumentType } from '@prisma/client';
import { IsString } from 'class-validator';

export class UploadInvoiceDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary', title: 'Новый файл' })
  file: any;
  @ApiProperty({
    title: 'Тип документа',
    enum: InvoiceDocumentType,
  })
  @IsString()
  type: InvoiceDocumentType;
  @ApiPropertyOptional({
    title: 'Имя файла',
  })
  @IsString()
  name?: string;
  @ApiProperty({
    title: 'ID платежа',
  })
  @IsString()
  invoiceId: string;
}
