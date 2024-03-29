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
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { Filters } from '../../common/types/Filters';
import { SignInError } from '../auth/dtos/error.dto';
// import { CustomerContractsEntity } from '../contracts/entity/customer-contracts.entity';
import { CustomerCandidateListQuery } from './dto/customer-candidate-filters.dto';
import { CustomerListQuery } from './dto/customer-filters.dto';
import { CustomerUpdateDto } from './dto/customer-update.dto';
import { CustomerCandidateEntity } from './entity/customer-candidate.entity';
import { CustomerGroupEntity } from './entity/customer-group.entity';
import {
  CustomerEntity,
  CustomerPasswordResponse,
} from './entity/customer.entity';
import {
  CustomerCandidatesResponse,
  CustomersResponse,
} from './entity/customers-list-response';
import { CustomerService } from './services/customer.service';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { Role, User } from '@prisma/client';
import { CustomerContractsEntity } from '../contracts/entity/customer-contracts.entity';
import { UserRepository } from './repositories/user.repository';
import { AccumulativeDiscountRepository } from '../accumulative-discount/accumulative-discount.repository';

@ApiTags('CUSTOMER API')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly userRepository: UserRepository,
    private readonly accumulativeDiscountsRepository: AccumulativeDiscountRepository
  ) { }

  @Get('/')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Список клиентов',
  })
  @ApiQuery({
    name: 'filters',
    required: true,
    description: 'JSON формат фильтров',
    type: CustomerListQuery,
  })
  @ApiOkResponse({ type: CustomersResponse })
  @Roles([Role.ADMIN, Role.GROUP])
  public async customers(
    @GetCurrentUser() user: User & { sub: number },
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query') query?: string,
  ): Promise<CustomersResponse> {

    const params = this.customerService.prepareFilters(page, limit, query);
    if (user.role === Role.GROUP) {
      const groupUser = await this.userRepository.findById(user.sub);
      console.log(params);
      if (groupUser) {
        if (params.where) params.where.groupId = groupUser.group.id;
        else
          params.where = {
            groupId: groupUser.group.id,
          };
      }
    }
    return this.customerService.getList(params);
  }

  @Get('/groups')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Список клиентов с подразделениями',
  })
  @ApiOkResponse({ type: [CustomerGroupEntity] })
  public async getCustomerGroups(
    @AdminOnly() _permission: any,
  ): Promise<CustomerGroupEntity[]> {
    return this.customerService.getCustomerGroups();
  }

  @Get('/candidates')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Список неподтвержденных клиентов',
  })
  @ApiQuery({
    name: 'filters',
    description: 'JSON формат фильтров',
    type: CustomerCandidateListQuery,
  })
  @ApiOkResponse({ type: CustomerCandidatesResponse })
  public async getCandidates(
    @Query('filters') filterString: string,
    @AdminOnly() permission: any,
  ): Promise<CustomerCandidatesResponse> {
    const filters: Filters = JSON.parse(filterString);
    return this.customerService.getCandidatesList(filters);
  }

  @Get('/candidates/:id')
  @ApiBearerAuth()
  @Public()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Получение неподтвержденного клиента',
  })
  @ApiOkResponse({ type: CustomerCandidateEntity })
  public async getCandidate(
    @Param('id') id: string,
  ): Promise<CustomerCandidateEntity | void> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    return this.customerService.customerCandidate(parsed);
  }



  @Delete('/candidates/:id')
  @ApiBearerAuth()
  @Public()
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Удаление неподтвержденного клиента',
  })
  @ApiOkResponse()
  public async removeCandidate(
    @Param('id') id: string,
  ): Promise<void> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    await this.customerService.removeCandidate(parsed);
  }

  @Get('/:id/discounts')
  @Public()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение списка накопительных скидок',
  })
  public async getCustomerDiscounts(@Param('id') customerId: string, @Query('contractId') contractId: string) {
    if (!contractId) throw new BadRequestException('Не указан id контракта ')
    if (isNaN(parseInt(contractId))) throw new BadRequestException('Неверный формат id контракта ')

    return this.accumulativeDiscountsRepository.getList(Number(contractId))
  }

  @Post('/discounts')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Добавление накопительной скидки',
  })
  public async addDiscount(@Body() data: any) {
    return this.accumulativeDiscountsRepository.create(data)
  }

  @Get('/:id/contracts')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Получение контрактов клиента',
  })
  @ApiOkResponse({ type: [CustomerContractsEntity] })
  public async getCustomerCandidateContracts(
    @Param('id') id: string,
    @AdminOnly() permission: any,
  ): Promise<CustomerContractsEntity[]> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    return this.customerService.getCustomerContracts(parsed);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Удаление клиента',
  })
  @ApiOkResponse()
  public async deleteCustomer(
    @AdminOnly() permission: any,
    @Param('id') id: string,
  ): Promise<void> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    await this.customerService.deleteCustomer(parsed);
  }

  @Delete('/candidates/:id')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Удаление неподтвержденного клиента',
  })
  @ApiOkResponse()
  public async deleteCustomerCandidate(
    @AdminOnly() permission: any,
    @Param('id') id: string,
  ): Promise<void> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    await this.customerService.deleteCustomerCandidate(parsed);
  }

  @Put('/:id')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Обновление клиента',
  })
  @ApiOkResponse({ type: CustomerEntity })
  public async updateCustomer(
    @AdminOnly() permission: any,
    @Param('id') id: string,
    @Body() body: CustomerUpdateDto,
  ): Promise<CustomerEntity> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }
    return this.customerService.updateCustomer(parsed, body);
  }

  @Put('/change-password/:id')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Обновление пароля клиента',
  })
  @ApiOkResponse({
    type: CustomerPasswordResponse,
  })
  public async changePassword(
    @AdminOnly() permission: any,
    @Param('id') id: string,
  ): Promise<CustomerPasswordResponse> {
    const parsed = parseInt(id);
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }

    return await this.customerService.generateNewPassword(parsed);
  }
}
