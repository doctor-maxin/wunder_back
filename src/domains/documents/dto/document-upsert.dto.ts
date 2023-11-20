import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpsertDocumentDto {
  @ApiProperty({ title: 'Ссылка на документ' })
  @IsString()
  link: string;

  @ApiPropertyOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional()
  @IsNumber()
  contractId?: number;
}
