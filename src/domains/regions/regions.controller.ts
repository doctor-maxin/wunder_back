import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegionEntity } from './entity/region.entity';
import { RegionWithSettings } from './entity/region-with-settings.entity';
import { RegionCreateDto } from './dto/region-create.dto';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { UpdateRegionSettings } from '../settings/entities/region-settings.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketClient } from '../../services/microservice/websocket.client';
import { CreateComplaintDto } from '../../common/dtos/create-complaint.dto';

@Controller('regions')
@ApiTags('REGION API')
export class RegionsController {
  constructor(
    private readonly regionService: RegionsService,
  ) // private readonly socketClient: WebSocketClient,
  // private readonly eventEmitter: EventEmitter2,
  { }

  @Get('/')
  @Public()
  @ApiOperation({ summary: 'Получение списка регионов' })
  @ApiOkResponse({ type: [RegionEntity] })
  public async regions(): Promise<RegionEntity[]> {
    return this.regionService.getRegions();
  }

  @Get('settings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Список настроек региона' })
  @ApiOkResponse({
    type: RegionWithSettings,
    isArray: true,
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async getRegionsWithSettings(
    @AdminOnly() permission: any,
  ): Promise<RegionWithSettings[]> {
    return this.regionService.getRegionsWithSettings();
  }

  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание региона' })
  @ApiCreatedResponse({ type: RegionWithSettings })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @HttpCode(201)
  public async createRegion(
    @AdminOnly() permission: any,
    @Body()
    data: RegionCreateDto,
  ) {
    return this.regionService.createRegion(data);
  }

  @Put('settings/update')
  @ApiOperation({ summary: 'Обновление настроек региона' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: UpdateRegionSettings })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async updateSettings(
    @AdminOnly() permission: any,
    @Body() data: UpdateRegionSettings,
  ) {
    return this.regionService.updateSettings(data);
  }

  @Delete('/settings-lines')
  @ApiOperation({ summary: 'Удаление элемента настроек региона' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async deleteSettingsLine(
    @Query('id') id: string,
    @Query('isCustomer') isCustomer: string,
  ) {
    const parsedId = parseInt(id);
    const isCustomerSettings = isCustomer === 'true' ? true : false;
    return this.regionService.removeSettingsLine(parsedId, isCustomerSettings);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Удаление региона' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBearerAuth()
  async deleteRegion(@Param('id') regionId: string) {
    await this.regionService.deleteRegion(parseInt(regionId));
  }

  @Public()
  @Post('/complaint')
  @ApiOkResponse()
  public async complaintProcess(@Body() data: CreateComplaintDto) {
    await this.regionService.createComplaint(data)
  }
}
