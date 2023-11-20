import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class BadGateway {
  @ApiProperty({
    default: 400,
    title: 'Код ошибки',
  })
  @IsNumber()
  statusCode: number;

  @ApiProperty({
    description: 'Список ошибок',
  })
  @IsString()
  message: string[];

  @ApiProperty({
    title: 'Текст ошибки',
    default: 'Bad Request',
  })
  @IsString()
  error: string;
}
