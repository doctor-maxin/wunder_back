import { ApiProperty } from '@nestjs/swagger';
import { RegionEntity } from './region.entity';
import { ContactEntity } from './contact.entity';
import { RegionSettingEntity } from '../../settings/entities/region-settings.entity';
import { RegionSystemSettingsEntity } from '../../settings/entities/region-system-settings.entity';
import { IRegionSystemSettings } from '../../../common/interfaces/settings.interface';
import { IContact } from '../../../common/interfaces/user.interface';

export class RegionWithSettings extends RegionEntity {
  @ApiProperty({
    type: [RegionSettingEntity],
  })
  settings: RegionSettingEntity[];

  @ApiProperty({
    type: ContactEntity,
  })
  contacts: IContact;

  @ApiProperty({
    type: [RegionSystemSettingsEntity],
  })
  systemSettings: IRegionSystemSettings[];
}
