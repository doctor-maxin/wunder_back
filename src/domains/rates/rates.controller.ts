import { Controller, Get, Query, BadRequestException, Body, Post } from '@nestjs/common';
import { RatesService } from './services/rates.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SellRatesEntity } from './entities/sell-rates.entity';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import {
  RatesFilters,
  RatesFiltersEntity,
} from './entities/rates-filters.entity';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { RatesResponse } from './entities/rates-response';
import { RateEntity } from './entities/rate.entity';
import { CreateRateDto } from './dtos/create-rate.dto';

@ApiTags('RATES API')
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) { }

  @Get()
  @Public()
  @ApiOkResponse({ type: SellRatesEntity })
  @ApiOperation({ summary: 'Курс валют активного региона' })
  findAll() {
    return this.ratesService.findAll();
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({ summary: 'Список курса валют' })
  @ApiOkResponse({ type: RatesResponse })
  @ApiQuery({
    type: RatesFiltersEntity,
    name: 'filters',
  })
  public async getList(
    @Query('filters') filtersString: string,
  ): Promise<RatesResponse> {
    if (!filtersString) throw new BadRequestException('Не указаны фильтры');
    const filters: RatesFilters = JSON.parse(filtersString);

    const [count, array] = await this.ratesService.getList(filters);
    return {
      count,
      array,
    };
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({ summary: 'Добавление курса валют' })
  @ApiOkResponse({ type: RateEntity })
  @Post()
  public async addRecord(@Body() body: CreateRateDto): Promise<RateEntity> {
    return this.ratesService.addRecord(body)
  }


  @Get('/fetch')
  @ApiOperation({ summary: 'Запустить обновление курсов валют' })
  @Public()
  public async fetchList(): Promise<void> {
    await this.ratesService.fetch();
  }
}
