import { IntersectionType } from '@nestjs/swagger';
import { DocumentEntity } from '../../documents/entity/document.entity';
import { CustomerSystemSettingsEntity } from '../../settings/entities/customer-system-settings.entity';
import { ContractsUpdateDto } from './contracts-update.dto';
import { CreateSettingsDto } from '../../settings/dto/create-settings.dto';

export class ContractEntityCreateDto extends IntersectionType(
  ContractsUpdateDto,
) {
  customerId: number;
  settings: CreateSettingsDto;
  systemSettings: CustomerSystemSettingsEntity[];
  documents: DocumentEntity[];
}
