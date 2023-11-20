import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UnAuthorized {
  @ApiProperty({
    default: 401,
    title: 'Статус ошибки',
  })
  @IsNumber()
  statusCode: number;

  @ApiProperty({
    title: 'Текст ошибки',
    default: 'Unauthorized',
  })
  @IsString()
  message: string;
}
