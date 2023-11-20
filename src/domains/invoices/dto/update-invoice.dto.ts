import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { InvoiceRatesEntity } from '../entity/invoice-rates.entity';
import {
  IInvoiceDocument,
  InvoiceEntity,
  invoiceDocument,
} from '../entity/invoice.entity';

export class UpdateInvoiceDto extends PartialType(
  OmitType(InvoiceEntity, [
    'cachedSystemSettings',
    'contractId',
    'createdAt',
    'customerId',
    'taskId',
    'currency',
  ] as const),
) {
  @ApiProperty({
    title: 'Валюта платежа',
    example: 'BYN',
  })
  @IsString()
  currency?: string;
  @ApiPropertyOptional({
    title: 'Курсы валют',
    type: PartialType(
      OmitType(InvoiceRatesEntity, ['id', 'invoiceId'] as const),
    ),
  })
  rates?: Pick<InvoiceRatesEntity, 'eurRate' | 'rubRate' | 'usdRate'>;

  @ApiProperty({
    title: 'Документы',
    type: [invoiceDocument],
  })
  invoiceDocument: IInvoiceDocument[];
}
