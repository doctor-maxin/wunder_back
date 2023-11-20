import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionSettingEntity } from './entities/region-settings.entity';
import { RegionSystemSettingsEntity } from './entities/region-system-settings.entity';
import { SettingsService } from './settings.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('SETTINGS API')
@Public()
@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global/systems')
  @ApiOperation({
    summary: 'Глобальные настройки систем активного региона',
  })
  @ApiOkResponse({ type: [RegionSystemSettingsEntity] })
  async getGlobalSystemSettings() {
    return this.settingsService.getGlobalSystemSettings();
  }

  @Get('global')
  @ApiOperation({
    summary: 'Глобальные настройки активного региона',
  })
  @ApiOkResponse({ type: RegionSettingEntity })
  async getGlobalSettings() {
    this.logger.debug('/api/settings/global');
    return this.settingsService.getGlobalSettings();
  }
}
