import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInError } from '../auth/dtos/error.dto';
import { AccountEntity } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { TopUpAccount } from './dto/top-up-account.dto';
import { TransferAccount } from './dto/transfer-account.dto';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('ACCOUNT API')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Get('/customer/')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Список аккаунтов пользователя',
  })
  @ApiOkResponse({ type: [AccountEntity] })
  public async getAllByCustomerId(@Query('customerId') customerId: string) {
    if (!customerId) throw new BadRequestException('customerId is required');
    return this.accountService.getCustomerAccounts(parseInt(customerId));
  }

  @Get('/')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: [AccountEntity] })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: BadGateway })
  @Roles([Role.ADMIN, Role.GROUP])
  @ApiOperation({
    summary: 'Список всех аккаунтов',
  })
  public async getList() {
    return this.accountService.getAll();
  }

  @Post('/')
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создать аккаунт пользователю',
  })
  @ApiOkResponse({ type: AccountEntity })
  public async create(
    @Body() body: CreateAccountDto & { customerId: number },
  ): Promise<AccountEntity> {
    return this.accountService.createAccount(body, body.customerId);
  }

  @Put('/:id')
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Обновить данные аккаунта пользователю',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: AccountEntity })
  @ApiForbiddenResponse({ type: SignInError })
  async updateAccount(
    @AdminOnly() _permission,
    @Param('id') id: string,
    @Body() data: UpdateAccountDto,
  ) {
    return await this.accountService.updateAccount(parseInt(id), data);
  }

  @Patch('/:id/update-balance')
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Запустить обновление баланса аккаунта',
  })
  @ApiParam({ name: 'id', description: 'ID аккаунта' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse({ type: SignInError })
  async updateBalance(
    @AdminOnly() _perm: any,
    @Param('id') id: number,
  ): Promise<void> {
    return this.accountService.updateBalance(id);
  }
  //
  @Put('/activate/:id')
  public async activate(
    @AdminOnly() permission: any,
    @Param('id') id: string,
    @Body() data: ActivateAccountDto,
  ): Promise<AccountEntity> {
    return await this.accountService.activateAccount(parseInt(id), data);
  }

  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Удаление аккаунта пользователя',
  })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOkResponse()
  async delete(@AdminOnly() _permission: any, @Param('id') id: string) {
    return await this.accountService.deleteAccount(parseInt(id));
  }

  @Post('top-up')
  @ApiOperation({
    summary: 'Пополнение баланса аккаунта пользователя',
  })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiCreatedResponse()
  async topUp(@Body() data: TopUpAccount) {
    return this.accountService.createTopUpBill(data);
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Перенос средств между аккаунтами пользователя',
  })
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiCreatedResponse()
  async transfer(@Body() data: TransferAccount) {
    return this.accountService.createTransfer(data);
  }
}
