import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ContractUpdateDto {
  id?: number;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsDateString()
  expireDate: string;
}
