import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class updateCategoryDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  sort: number;
}
