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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { RtGard } from '../../common/gards/rt.gard';
import { CustomerCandidateEntity } from '../users/entity/customer-candidate.entity';
import { SignInError } from './dtos/error.dto';
import { SignInAsUserDto, SignInDto } from './dtos/signin.dto';
import { CreateUserDto, SignUpDto } from './dtos/signup.dto';
import { RefreshToken, Token } from './dtos/token.dto';
import { AuthService } from './services/auth.service';

import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { IToken } from '../../common/interfaces/auth.interface';
import { BadGateway } from '../../common/schemas/bad-gateway';
import { UnAuthorized } from '../../common/schemas/unauthorized';
import { UserAdminEntity } from '../users/entity/admin.entity';
import { UserGroupEntity } from '../users/entity/customer-group.entity';
import { ExtendedUser, UserCustomerEntity } from '../users/entity/user.entity';
import { CompleteSignupDto } from './dtos/signup-complete.dto';
import { Role } from '@prisma/client';

@ApiTags('AUTH API')
@ApiExtraModels(Token)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @ApiOperation({
    summary: 'Вход в систему',
  })
  @ApiOkResponse({ type: Token })
  @ApiBadRequestResponse({ type: SignInError })
  @ApiForbiddenResponse({ type: SignInError })
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<IToken> {
    return this.authService.signIn(signInDto);
  }

  @Get('/me')
  @ApiOperation({
    summary: 'Получение данных авторизованного клиента по токену',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ExtendedUser })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  public async getMyData(
    @GetCurrentUserId() userId: number,
  ): Promise<Omit<ExtendedUser, 'secret'> & { contracts: any[] }> {
    return this.authService.getMyData(userId);
  }

  @Public()
  @ApiBadRequestResponse({ type: SignInError })
  @ApiOkResponse({ type: CustomerCandidateEntity })
  @ApiOperation({
    summary: 'Первичная регистрация',
  })
  @Post('signup')
  public async signup(
    @Body() signupDto: SignUpDto,
  ): Promise<CustomerCandidateEntity> {
    return this.authService.signUp(signupDto);
  }

  @Public()
  @ApiBadRequestResponse({ type: SignInError })
  @ApiForbiddenResponse()
  // @ApiOkResponse({
  //   schema: {
  //     oneOf: [
  //       { $ref: getSchemaPath(UserCustomerEntity) },
  //       { $ref: getSchemaPath(UserAdminEntity) },
  //       { $ref: getSchemaPath(UserGroupEntity) },
  //     ],
  //   },
  // })
  @ApiOperation({
    summary: 'Создание пользователя',
  })
  @Post('users')
  public async createUser(
    @Body() data: CreateUserDto,
  ): Promise<UserCustomerEntity | UserAdminEntity | UserGroupEntity> {
    return this.authService.createUser(data);
  }

  @Public()
  @UseGuards(RtGard)
  @ApiBadRequestResponse({ type: SignInError })
  @Post('refresh')
  @ApiOperation({
    summary: 'Обновление токена',
  })
  @ApiOkResponse({ type: Token })
  @ApiBody({ type: RefreshToken })
  public async refreshHandler(
    @Body() data: Pick<Token, 'refresh_token'>,
  ): Promise<Token> {
    return this.authService.refreshToken(data.refresh_token);
  }

  @Post('/as-user')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOkResponse({ type: Token })
  @ApiOperation({
    summary: 'Авторизация в пользователя',
  })
  @Roles([Role.ADMIN, Role.GROUP])
  public async signInAsUser(@Body() data: SignInAsUserDto): Promise<any> {
    return this.authService.signInAsUser(data.id);
  }

  @Post('/complete')
  @Public()
  @ApiBadRequestResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Завершение регистрации',
  })
  @ApiCreatedResponse()
  public async completeUser(@Body() signUpDto: CompleteSignupDto) {
    return this.authService.signUpComplete(signUpDto);
  }

  @Get('/users')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Получение списка пользователей',
  })
  public async getUsers(@Query('page') page: string) {
    return this.authService.getList(page);
  }

  @Delete('/users/:id')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiUnauthorizedResponse({ type: UnAuthorized })
  @ApiOperation({
    summary: 'Удаление пользователя',
  })
  public async removeUser(@Param('id') id: string) {
    if (!id) throw new BadRequestException('Не указан id пользователя');
    if (isNaN(Number(id))) throw new BadRequestException('Неверный формат id');
    return this.authService.removeUser(Number(id));
  }

  @Put('/users')
  @ApiBearerAuth()
  @ApiForbiddenResponse({ type: SignInError })
  @ApiBadRequestResponse({ type: BadGateway })
  @ApiOperation({
    summary: 'Обновление пользователя',
  })
  // @ApiOkResponse({
  //   schema: {
  //     oneOf: [
  //       { $ref: getSchemaPath(UserCustomerEntity) },
  //       { $ref: getSchemaPath(UserAdminEntity) },
  //       { $ref: getSchemaPath(UserGroupEntity) },
  //     ],
  //   },
  // })
  public async updateUser(
    @AdminOnly() _permission: any,
    @Body() data: UserCustomerEntity | UserAdminEntity | UserGroupEntity,
  ): Promise<UserCustomerEntity | UserAdminEntity | UserGroupEntity> {
    const isExists = await this.authService.checkUserExists(data.id);
    if (!isExists) throw new BadRequestException('Пользовател не найден');
    return this.authService.updateUser(data);
  }
}
