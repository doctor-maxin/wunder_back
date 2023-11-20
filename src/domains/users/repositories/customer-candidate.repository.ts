import { Injectable } from '@nestjs/common';
import {
  ICustomer,
  ICustomerCandidate,
} from '../../../common/interfaces/user.interface';
import { CustomerFiltersDto } from '../dto/customer-filters.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { SignUpDto } from '../../auth/dtos/signup.dto';

@Injectable()
export class CustomerCandidateRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: number): Promise<ICustomerCandidate | void> {
    return this.prisma.customerCandidate.findUnique({ where: { id } });
  }

  public async deleteCustomer(id: number): Promise<void> {
    await this.prisma.customerCandidate.delete({ where: { id } });
  }

  public async bindCustomerId(id: number, customerId: number): Promise<void> {
    await this.prisma.customerCandidate.update({
      where: { id },
      data: {
        customerId,
      },
    });
  }

  public async getList(
    params: Pick<CustomerFiltersDto, 'take' | 'skip'> & { orderBy: any },
  ): Promise<ICustomerCandidate[]> {
    return this.prisma.customerCandidate.findMany(params);
  }

  public async getCount(): Promise<number> {
    return this.prisma.customerCandidate.count();
  }

  public async createCustomer(data: SignUpDto): Promise<ICustomerCandidate> {
    return this.prisma.customerCandidate.create({
      data: {
        companyName: data.companyName,
        //@ts-ignore
        regionName: data.region,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhoneNumber: data.contactPhoneNumber,
        companyTaxNumber: data.companyTaxNumber,
        publicAgree: data.publicAgree,
      },
    });
  }

  public async bindTaskId(customerId: number, taskId: number) {
    return this.prisma.customerCandidate.update({
      where: { id: customerId },
      data: {
        taskId,
      },
    });
  }
}
