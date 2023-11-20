import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DocumentEntity {
  @ApiProperty({ title: 'Ссылка на документ' })
  @IsString()
  link: string;

  @ApiPropertyOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  contractId: number;
}
