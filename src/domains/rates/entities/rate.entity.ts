import { IRate } from '../../../common/interfaces/rate.interface';
import {
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class RateEntity implements IRate {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({
    title: 'Дата получения курса',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: '6.16' })
  @IsString()
  eurRate: string;

  @ApiProperty({ example: '6.16' })
  @IsString()
  rubRate: string;

  @ApiProperty({ example: '6.16' })
  @IsString()
  usdRate: string;

  @ApiProperty({ title: 'Валюта в отношении', example: 'BY' })
  @IsString()
  fromRate: string;
}

export type Rate = {
  currency?: string;
  value?: string;
};
