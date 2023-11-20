import { IRegionSettings, IRegionSystemSettings } from './settings.interface';
import { IContact } from './user.interface';

export interface IRegion {
  id: number;
  name: string;
  isActive: boolean;
  contacts?: IContact;
  sign?: string;
  settings?: IRegionSettings;
  systemSettings?: IRegionSystemSettings;
  currency: string;
}
