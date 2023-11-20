export class CreateSystemSettingsDto {
  systemName: string;
  regionId: number;
  currency?: string;
  isActive?: boolean;
  minSum?: number;
}
