import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';

export class SettingsUpdateDto {
  @IsNotEmpty()
  @IsBoolean()
  allowTransfer: true;

  @IsNotEmpty()
  @IsString()
  emailFrom: string;

  @IsNotEmpty()
  @IsNumber()
  freeHours: number;

  @IsNotEmpty()
  @IsNumber()
  freeTimes: number;

  @Matches(/^(0|[1-9][0-9]{0,2})(\d{3})*(\.\d{1,2})?$/)
  hourCost: string;

  @IsNotEmpty()
  @IsBoolean()
  prepay: true;

  @IsNotEmpty()
  @IsNumber()
  ratesAdds: number;

  @IsNotEmpty()
  @IsNumber()
  vat: number;
}
