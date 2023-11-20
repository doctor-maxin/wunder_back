import { Matches } from 'class-validator';

export class UpdateSystemSettingsDto {
  @Matches(/^(0|[1-9][0-9]{0,2})(\d{3})*(\.\d{1,2})?$/)
  minSum?: string;
  isActive?: boolean;
}
