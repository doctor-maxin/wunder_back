import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemEntity } from './entity/system.entity';
import { SystemRepository } from './system.repository';
import { Public } from '../../common/decorators/public.decorator';

@Injectable()
@Controller('systems')
@ApiTags('SYSTEMS API')
export class SystemController {
  constructor(private readonly systemRepository: SystemRepository) {}

  @ApiOperation({ summary: 'Получение списка рекламных систем' })
  @ApiOkResponse({ type: [SystemEntity] })
  @Public()
  @Get('/')
  public async getList(): Promise<SystemEntity[]> {
    return this.systemRepository.getList();
  }
}
