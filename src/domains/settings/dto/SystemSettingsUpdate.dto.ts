import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SystemSettingsUpdateDto {
  @Matches(/^(0|[1-9][0-9]{0,2})(\d{3})*(\.\d{1,2})?$/)
  minSum: string;

  @IsNotEmpty()
  @IsString()
  systemName: 'Яндекс Взгляд';
}
