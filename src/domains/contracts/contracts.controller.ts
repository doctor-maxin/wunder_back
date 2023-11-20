import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IContract } from '../../common/interfaces/account.interface';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { CustomerRepository } from '../users/repositories/customer.repository';
import { ContractsService } from './contracts.service';
import { ContractEntityCreateDto } from './dto/contract-entity-create.dto';
import { ContractEntityUpdateDto } from './dto/contract-entity-update.dto';
import { ContractsListDto } from './dto/contracts-list.dto';
import { ContractEntity } from './entity/contract.entity';

@ApiTags('CONTRACT API')
@Controller('contracts')
export class ContractsController {
  constructor(
    private contractsService: ContractsService,
    private customerRepository: CustomerRepository,
  ) {}

  @Get('/customer')
  @ApiOperation({
    summary: 'Список контрактов для пользователя',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: ContractsListDto })
  @ApiQuery({
    name: 'customerId',
    description: 'Id пользователя',
    example: '2',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Кол-во выдачи',
    required: false,
    example: '10',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Индекс с которого начать выдачу, нужно для пагинации',
    required: false,
    example: '11',
  })
  @ApiQuery({
    name: 'query',
    description: 'Ключевое слово для поиска',
    required: false,
  })
  @ApiQuery({
    name: 'contractId',
    description: 'Id договора',
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Дата начала договора',
    required: false,
    example: '22-03-2023',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Дата окончания договора',
    required: false,
    example: '22-03-2023',
  })
  async getList(
    @GetCurrentUserId() userId: number,
    @Query('limit') limit = '10',
    @Query('skip') skip = '0',
    @Query('query') query?: string,
    @Query('contractId') contractId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new BadRequestException();
    }

    return await this.contractsService.getList(
      customer.id,
      Number(limit),
      Number(skip),
      query,
      fromDate,
      endDate,
      contractId,
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'Список контрактов',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: ContractsListDto })
  @ApiQuery({
    name: 'customerId',
    description: 'Id пользователя',
    example: '2',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Кол-во выдачи',
    required: false,
    example: '10',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Индекс с которого начать выдачу, нужно для пагинации',
    required: false,
    example: '11',
  })
  @ApiQuery({
    name: 'query',
    description: 'Ключевое слово для поиска',
    required: false,
  })
  @ApiQuery({
    name: 'contractId',
    description: 'Id договора',
    required: false,
  })
  @ApiQuery({
    name: 'fromDate',
    description: 'Дата начала договора',
    required: false,
    example: '22-03-2023',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Дата окончания договора',
    required: false,
    example: '22-03-2023',
  })
  async getListAdmin(
    @AdminOnly() _permission: any,
    @Query('customerId') customerId: number,
    @Query('limit') limit = '10',
    @Query('skip') skip = '0',
    @Query('query') query?: string,
    @Query('contractId') contractId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.contractsService.getList(
      customerId ? Number(customerId) : undefined,
      Number(limit),
      Number(skip),
      query,
      fromDate,
      endDate,
      contractId,
    );
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Удаление договора',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse()
  async delete(
    @Param('id')
    contractId: string,
  ) {
    const parsedContractId = parseInt(contractId);
    if (isNaN(parsedContractId)) {
      throw new BadRequestException();
    }

    return await this.contractsService.deleteContract(parsedContractId);
  }

  @Get('/:id')
  public async getContract(
    @Param('id') contractId: string,
  ): Promise<IContract> {
    const parsedContractId = parseInt(contractId);
    if (isNaN(parsedContractId)) {
      throw new BadRequestException();
    }
    return this.contractsService.getContract(parsedContractId);
  }

  @Put('/:id')
  @ApiOperation({
    summary: 'Обновление данных договора',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: ContractEntity })
  async updateContract(
    @Param('id') contractId: number,
    @Body() data: ContractEntityUpdateDto,
  ): Promise<ContractEntity> {
    return this.contractsService.updateContract(Number(contractId), data);
  }

  @Post('/')
  @ApiOperation({
    summary: 'Создание договора',
  })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: ContractEntity })
  async createContract(
    @Body()
    data: ContractEntityCreateDto,
  ): Promise<ContractEntity> {
    return await this.contractsService.createContract(data);
  }

  @Delete('/customer-line/:id')
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async deleteCustomerSystemLine(@Param('id') id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) throw new BadRequestException('Невалидный id');
    await this.contractsService.deleteCustomerSystemLine(parsedId);
  }

  @Delete('/line/:id')
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async deleteSystemLine(@Param('id') id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) throw new BadRequestException('Невалидный id');
    await this.contractsService.deleteSystemLine(parsedId);
  }
}
