import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ICustomer,
  ICustomerGroup,
} from '../../../common/interfaces/user.interface';
import { CustomerCreateDto } from '../dto/customer-create.dto';
import { CustomerRepository } from '../repositories/customer.repository';
import { Filters } from '../../../common/types/Filters';
import { Prisma } from '@prisma/client';
import { CustomerFiltersDto } from '../dto/customer-filters.dto';
import {
  CustomerCandidatesResponse,
  CustomersResponse,
} from '../entity/customers-list-response';
import { CustomerCandidateRepository } from '../repositories/customer-candidate.repository';
import { CustomerCandidateEntity } from '../entity/customer-candidate.entity';
import * as passwordGenerator from 'generate-password';
import { UserRepository } from '../repositories/user.repository';
import { CustomerPasswordResponse } from '../entity/customer.entity';
import { IContract } from '../../../common/interfaces/account.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { CustomerUpdateDto } from '../dto/customer-update.dto';
import { CustomerCompleteEvent } from '../../../common/events/customer.events';
import { ON_CUSTOMER_COMPLETE_SIGNUP } from '../../../common/events/events';
import { ContractsRepository } from '../../contracts/contracts.repository';
import { EmailService } from '../../../services/email/email.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerCandidateRepository: CustomerCandidateRepository,
    private readonly userRepository: UserRepository,
    private readonly contractRepository: ContractsRepository,
    private readonly emailService: EmailService,
  ) {}

  public async getCustomerContracts(
    customerId: number,
  ): Promise<Omit<IContract, 'customer' | 'settings' | 'systemSettings'>[]> {
    return this.contractRepository.getCustomerContracts(customerId);
  }

  public async generateNewPassword(
    customerId: number,
  ): Promise<CustomerPasswordResponse> {
    const password = passwordGenerator.generate({
      length: 10,
      numbers: true,
    });

    const customer = await this.customerRepository.findById<ICustomer>(
      customerId,
    );
    if (!customer) throw new BadRequestException();
    await this.userRepository.updatePassword(customer.userId, password);
    this.emailService.confirmCustomer(customer, password);

    return { password };
  }

  public async updateCustomer(
    customerId: number,
    payload: CustomerUpdateDto,
  ): Promise<ICustomer> {
    return this.customerRepository.updateCustomer(customerId, payload);
  }

  public async getList(params: CustomerFiltersDto): Promise<CustomersResponse> {
    const [count, array] = await Promise.all([
      this.customerRepository.getCount(params.where),
      this.customerRepository.getList(params),
    ]);
    return {
      count,
      array,
    };
  }

  public async getCandidatesList(
    params: Filters,
  ): Promise<CustomerCandidatesResponse> {
    const [count, array] = await Promise.all([
      this.customerCandidateRepository.getCount(),
      this.customerCandidateRepository.getList({
        take: params.limit,
        skip: params.skip,
        orderBy: {
          id: 'desc',
        },
      }),
    ]);
    return {
      count,
      array,
    };
  }

  public async customerCandidate(
    customerCandidateId: number,
  ): Promise<CustomerCandidateEntity | void> {
    return this.customerCandidateRepository.findById(customerCandidateId);
  }

  public async deleteCustomer(id: number): Promise<void> {
    await this.customerRepository.deleteCustomer(id);
  }

  public async getCustomerGroups(): Promise<ICustomerGroup[]> {
    return this.customerRepository.getCustomerGroupList();
  }

  @OnEvent(ON_CUSTOMER_COMPLETE_SIGNUP)
  public async bindCustomerToCustomerCandidate(
    payload: CustomerCompleteEvent,
  ): Promise<void> {
    await this.customerCandidateRepository.bindCustomerId(
      payload.customerCandidateId,
      payload.customer.id,
    );
  }

  public async deleteCustomerCandidate(id: number): Promise<void> {
    await this.customerCandidateRepository.deleteCustomer(id);
  }

  public async createCustomer(
    payload: CustomerCreateDto,
    userId: number,
  ): Promise<ICustomer> {
    const customer = await this.customerRepository.createCustomer(
      payload,
      userId,
    );
    this.emailService.customerCandidateSuccessRegistration(customer);
    return customer;
  }

  public prepareFilters(filters: Filters): CustomerFiltersDto {
    const params = {
      take: filters.limit,
      skip: filters.skip,
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      include: {
        accounts: true,
        settings: true,
        contracts: {
          include: {
            systemSettings: {
              where: {
                NOT: [
                  {
                    contractId: undefined,
                  },
                  {
                    contractId: null,
                  },
                ],
              },
              include: {
                lines: true,
              },
            },
          },
        },
      },
      where: undefined,
    };
    if (filters.query) {
      params.where = {
        OR: [
          {
            companyName: { contains: filters.query },
          },
          {
            companyAddress: { contains: filters.query },
          },
          {
            companyPhoneNumber: { contains: filters.query },
          },
          {
            contactPhoneNumber: { contains: filters.query },
          },
          {
            companyTaxNumber: { contains: filters.query },
          },
          {
            responsiblePersonFullName: { contains: filters.query },
          },
          {
            responsiblePersonPosition: { contains: filters.query },
          },
          {
            companyEmail: { contains: filters.query },
          },
          {
            contactEmail: { contains: filters.query },
          },
          {
            contactName: { contains: filters.query },
          },
          {
            accountNumber: { contains: filters.query },
          },
          {
            BIC: { contains: filters.query },
          },
          {
            bankAddress: { contains: filters.query },
          },
          {
            bankName: { contains: filters.query },
          },
        ],
      };
      if (Number.isInteger(parseInt(filters.query))) {
        params.where.OR.push({
          planFixId: { equals: parseInt(filters.query) },
        });
      }
    }
    return params;
  }
}
