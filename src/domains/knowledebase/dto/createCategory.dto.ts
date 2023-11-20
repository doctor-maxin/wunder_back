import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class createCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  sort: number;
}
