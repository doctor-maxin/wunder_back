import { IntersectionType } from '@nestjs/swagger';
import { UpdateCustomerSettingsDto } from '../../settings/dto/update-customer-settings.dto';
import { DocumentEntity } from '../../documents/entity/document.entity';
import { CustomerSystemSettingsEntity } from '../../settings/entities/customer-system-settings.entity';
import { ContractsUpdateDto } from './contracts-update.dto';

export class ContractEntityUpdateDto extends IntersectionType(
  ContractsUpdateDto,
) {
  settings: UpdateCustomerSettingsDto;
  systemSettings: CustomerSystemSettingsEntity[];
  documents: DocumentEntity[];
}
