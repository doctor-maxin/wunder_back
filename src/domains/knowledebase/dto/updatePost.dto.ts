import { IsNumber, IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class updatePostDto {
  @IsNumber()
  @IsDefined()
  id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  categoryID: number;

  @IsDefined()
  body: string;

  preview?: string;

  toMain?: boolean;

  @IsNumber()
  sort: number;
}
