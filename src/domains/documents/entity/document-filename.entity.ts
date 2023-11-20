import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DocumentFilenameEntity {
  @ApiProperty({ description: 'Наименование загруженного файла' })
  @IsString()
  filename: string;
}
