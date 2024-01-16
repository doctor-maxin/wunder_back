import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UserRepository } from '../../users/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './hash.service';
import { Token } from '../dtos/token.dto';
import { CreateUserDto, SignUpDto } from '../dtos/signup.dto';
import { CustomerCandidateEntity } from '../../users/entity/customer-candidate.entity';
import { CompleteSignupDto } from '../dtos/signup-complete.dto';
import { CustomerEntity } from '../../users/entity/customer.entity';
import { SettingsRepository } from '../../settings/repositories/settings.repository';
import { CustomerService } from '../../users/services/customer.service';
import { CustomerCreateDto } from '../../users/dto/customer-create.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomerCandidateRepository } from '../../users/repositories/customer-candidate.repository';
import { CustomerRepository } from '../../users/repositories/customer.repository';
import {
  ICustomer,
  ICustomerCandidate,
  ICustomerGroup,
  IUser,
} from '../../../common/interfaces/user.interface';
import { CustomerCompleteEvent } from '../../../common/events/customer.events';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from '../../../common/constants';
import {
  ON_CUSTOMER_CANDIDATE_CREATE,
  ON_CUSTOMER_COMPLETE_SIGNUP,
} from '../../../common/events/events';
import { UserCustomerEntity } from '../../users/entity/user.entity';
import { UserAdminEntity } from '../../users/entity/admin.entity';
import { UserGroupEntity } from '../../users/entity/customer-group.entity';
import { Role } from '@prisma/client';
import { PlanFixTransport } from '../../../integrations/planfix/planfix.transport';
import { ContractsRepository } from '../../contracts/contracts.repository';
import { PlanFixStatus } from '../../../integrations/planfix/planfix.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly customerCandidateRepository: CustomerCandidateRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly settingsRepository: SettingsRepository,
    private readonly customerService: CustomerService,
    private readonly customerRepository: CustomerRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly planfixService: PlanFixTransport,
    private readonly contractRepository: ContractsRepository,
  ) {}

  public async getMyData(userId: number): Promise<
    Pick<IUser, 'id' | 'role' | 'email' | 'customer'> & {
      contracts: any[];
      group?: ICustomerGroup;
    }
  > {
    this.logger.log('Получение данных пользователя ' + userId);
    const user = await this.userRepository.findById(userId);

    if (!user) throw new BadRequestException('Пользователь не найден');
    this.logger.log('[getMyData] Найден пользователь ');

    if (user.role === Role.ADMIN) {
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        contracts: [],
      };
    } else if (user.role === Role.GROUP) {
      const group = await this.customerRepository.getCustomerGroup(
        user.group.id,
      );
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        contracts: [],
        group,
      };
    } else {
      const customer = await this.customerRepository.findById<ICustomer>(
        user.customer.id,
      );
      const contracts = await this.contractRepository.getCustomerContracts(
        customer.id,
        true,
        true,
      );

      return {
        id: user.id,
        role: user.role,
        email: user.email,
        customer,
        contracts,
      };
    }
  }

  public async checkUserExists(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    return Boolean(user);
  }
  public async updateUser(
    data: UserCustomerEntity | UserAdminEntity | UserGroupEntity,
  ): Promise<UserCustomerEntity | UserAdminEntity | UserGroupEntity> {
    const user = await this.userRepository.findById(data.id);
    if (user.secret !== data.secret)
      data.secret = await this.hashService.hashData(data.secret);
    this.logger.debug(`[updateUser]`, data);

    if (data.role === Role.ADMIN) {
      //@ts-ignore
      return this.userRepository.updateAdmin(data);
    } else if (data.role === Role.GROUP) {
      //@ts-ignore
      return this.userRepository.updateCustomerGroup(data);
    } else {
      //@ts-ignore
      return this.userRepository.updateCustomer(data);
    }
  }

  public async getList(page = '10'): Promise<[number, IUser[]]> {
    const total = await this.userRepository.getCount(Number(page));
    const list = await this.userRepository.getList(Number(page));

    return [total ?? 0, list ?? []];
  }

  public async signIn(data: SignInDto): Promise<Token> {
    const { username, password } = data;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new ForbiddenException('Неверный email или пароль');
    }
    const token = await this.generateToken(user);
    return token;
  }

  public async signInAsUser(userId: number): Promise<Token> {
    const user = await this.userRepository.findById(userId);

    return this.generateToken(user);
  }

  public async createUser(
    data: CreateUserDto,
  ): Promise<UserCustomerEntity | UserAdminEntity | UserGroupEntity> {
    const checkDuplicates = await this.userRepository.findByEmail(data.email);
    if (checkDuplicates)
      throw new BadRequestException('Данный email уже занят');
    if (!data.role) throw new BadRequestException('Роль не указана');

    data.secret = await this.hashService.hashData(data.secret);

    switch (data.role) {
      case Role.ADMIN: {
        return this.userRepository.createAdmin(data);
      }
      case Role.CUSTOMER: {
        return this.userRepository.createCustomer(data);
      }
      case Role.GROUP: {
        return this.userRepository.createCustomerGroup(data);
      }
    }
  }

  public async signUp(data: SignUpDto): Promise<CustomerCandidateEntity> {
    this.logger.debug('Регистрация для ' + data.contactEmail);
    const customerCandidate =
      await this.customerCandidateRepository.createCustomer(data);
    const settings = await this.settingsRepository.globalSettings();
    this.logger.verbose(
      'Создан customerCandidate: ' + customerCandidate.companyName,
    );
    this.logger.debug(customerCandidate);

    await this.eventEmitter.emitAsync(
      ON_CUSTOMER_CANDIDATE_CREATE,
      customerCandidate,
      settings.planFixManagerId,
    );

    return customerCandidate;
  }

  public async refreshToken(refreshToken: string): Promise<Token> {
    const decoded = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.userRepository.findById(decoded.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateToken(user);
  }

  public async removeUser(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new BadRequestException('Пользователь не найден');
    await this.userRepository.deleteUser(id);
  }

  public async signUpComplete(
    data: CompleteSignupDto,
  ): Promise<CustomerEntity> {
    this.logger.log('Завершение регистрации для ' + data.companyEmail);
    await this.validateCustomerCandidatePayload(data);

    const candidate = await this.customerCandidateRepository.findById(
      data.customerCandidateId,
    );
    this.logger.debug('Found candidate', candidate);
    if (!candidate) throw new BadRequestException();
    const remoteTask = await this.planfixService.getTask(
      String(candidate.taskId),
    );
    this.logger.debug('remoteTask', remoteTask);
    if (remoteTask && remoteTask.status.id === PlanFixStatus.Fail)
      throw new BadRequestException(
        'Регистрационные данные невалидны, вернитесь к предыдущем этапу',
      );

    const newUser = await this.userRepository.createUser(data.companyEmail);
    this.logger.log('Создан новый пользователь: ' + data.companyEmail);

    const regionSettings = await this.settingsRepository.globalSettings();

    const payload = this.convertCustomerCandidateToCustomer(
      newUser.id,
      data,
      candidate,
    );
    const newCustomer = await this.customerService.createCustomer(
      payload,
      newUser.id,
    );
    this.logger.log('Создан новый покупатель: ' + newCustomer.id);

    await this.eventEmitter.emitAsync(
      ON_CUSTOMER_COMPLETE_SIGNUP,
      new CustomerCompleteEvent(
        newCustomer,
        regionSettings,
        data.customerCandidateId,
        remoteTask.id,
      ),
    );

    return Object.assign(newCustomer, { contracts: [], user: newUser });
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<Pick<IUser, 'id' | 'role' | 'email'> | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    const isPasswordValid = await this.hashService.compare(
      password,
      user.secret,
    );
    if (!isPasswordValid) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async generateToken(
    user: Pick<IUser, 'id' | 'email' | 'role'>,
  ): Promise<Token> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_SECRET,
    });

    return <Token>{
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private convertCustomerCandidateToCustomer(
    userid: number,
    signupDto: CompleteSignupDto,
    candidate: ICustomerCandidate,
  ): CustomerCreateDto {
    return {
      companyName: candidate.companyName,
      accountNumber: signupDto.accountNumber,
      companyTaxNumber: candidate.companyTaxNumber,
      BIC: signupDto.BIC,
      bankAddress: signupDto.bankAddress,
      bankName: signupDto.bankName,
      companyAddress: signupDto.companyAddress,
      companyEmail: signupDto.companyEmail,
      contactEmail: candidate.contactEmail,
      contactName: candidate.contactName,
      contactPhoneNumber: candidate.contactPhoneNumber,
      postalAddress: signupDto.postalAddress,
      responsiblePersonFullName: signupDto.responsiblePersonFullName,
      responsiblePersonPosition: signupDto.responsiblePersonPosition,
      signatureDocumentType: signupDto.signatureDocumentType,
      publicAgree: candidate.publicAgree,
      companyPhoneNumber: signupDto.companyPhoneNumber,
      isActive: signupDto.isActive,
      isNew: signupDto.isNew,
    };
  }

  private async validateCustomerCandidatePayload(payload: CompleteSignupDto) {
    const isEmailBusy = await this.userRepository.findByEmail(
      payload.companyEmail,
    );
    console.log(isEmailBusy);
    if (isEmailBusy) throw new BadRequestException('Данная почта занята');
  }
}
