import { Injectable, Logger } from '@nestjs/common';
import {
  IAdmin,
  ICustomer,
  ICustomerGroup,
  IUser,
  IUserAdmin,
  IUserCustomer,
  IUserCustomerGroup,
} from '../../../common/interfaces/user.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateUserAdminPayload,
  CreateUserCustomerPayload,
  CreateUserDto,
  CreateUserGroupPayload,
} from '../../auth/dtos/signup.dto';
import { UserAdminEntity } from '../entity/admin.entity';
import { UserGroupEntity } from '../entity/customer-group.entity';
import { UserCustomerEntity } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(UserRepository.name);

  public async updatePassword(
    userId: number,
    password: string,
  ): Promise<IUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { secret: password },
    });
  }

  public async getCount(page: number) {
    return this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
      },
      skip: 10 * (page - 1),
    });
  }

  public async updateAdmin(data: IUserAdmin): Promise<UserAdminEntity> {
    return this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        secret: data.secret,
        email: data.email,
        admin: {
          update: {
            name: data.admin.name,
          },
        },
      },
      include: {
        admin: true,
      },
    });
  }

  public async updateCustomerGroup(
    data: IUserCustomerGroup,
  ): Promise<UserGroupEntity> {
    return this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        secret: data.secret,
        email: data.email,
        group: {
          update: {
            companyEmail: data.group.companyEmail,
            companyName: data.group.companyName,
          },
        },
      },
      include: {
        group: true,
      },
    });
  }

  public async updateCustomer(
    data: IUserCustomer,
  ): Promise<UserCustomerEntity> {
    await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        secret: data.secret,
        email: data.email,
      },
    });
    this.logger.debug('[updateCustomer]', data);
    console.log('data', data.customer.groupId);
    if (data.customer.groupId) {
      await this.prisma.customer.update({
        where: {
          id: data.customer.id,
        },
        data: {
          customerGroup: {
            connect: {
              id: data.customer.groupId,
            },
          },
        },
      });
    }
    return this.prisma.user.findUnique({
      where: {
        id: data.id,
      },
      include: {
        customer: {
          include: {
            customerGroup: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });
  }

  public async getList(page: number) {
    return this.prisma.user.findMany({
      skip: 10 * (page - 1),
      where: {
        OR: [
          {
            role: 'CUSTOMER',
          },
          {
            role: 'GROUP',
          },
        ],
      },
      orderBy: {
        id: 'desc',
      },
      include: {
        admin: true,
        customer: {
          include: {
            customerGroup: {
              select: {
                companyName: true,
              },
            },
          },
        },
        group: true,
      },
    });
  }

  public async createUser(email: string): Promise<IUser> {
    return this.prisma.user.create({
      data: {
        email,
      },
    });
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: number): Promise<
    | (IUser & {
        admin?: IAdmin;
        customer?: ICustomer;
        group?: ICustomerGroup;
      })
    | null
  > {
    return this.prisma.user.findUnique({
      where: { id },
      include: { customer: true, group: true, admin: true },
    });
  }

  public async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  public async createAdmin(data: CreateUserDto): Promise<IUserAdmin> {
    const { payload } = data as { payload: CreateUserAdminPayload };

    return this.prisma.user.create({
      data: {
        email: data.email,
        secret: data.secret,
        role: 'ADMIN',
        admin: {
          create: {
            name: payload.name ?? 'Admin',
          },
        },
      },
      include: {
        admin: true,
      },
    });
  }

  public async createCustomer(data: CreateUserDto): Promise<IUserCustomer> {
    const { payload } = data as { payload: CreateUserCustomerPayload };
    return this.prisma.user.create({
      data: {
        email: data.email,
        secret: data.secret,
        role: 'CUSTOMER',
        customer: {
          create: {
            companyEmail: data.email,
            contactEmail: payload.contactEmail,
            contactName: payload.contactName,
            contactPhoneNumber: payload.contactPhoneNumber,
            publicAgree: true,
            companyName: payload.companyName,
            companyTaxNumber: payload.companyTaxNumber,
            BIC: '',
            accountNumber: '',
            bankAddress: '',
            bankName: '',
            postalAddress: '',
            companyAddress: '',
            responsiblePersonFullName: '',
            responsiblePersonPosition: '',
            signatureDocumentType: '',
          },
        },
      },
      include: {
        customer: true,
      },
    });
  }

  public async createCustomerGroup(
    data: CreateUserDto,
  ): Promise<IUserCustomerGroup> {
    const { payload } = data as { payload: CreateUserGroupPayload };

    return this.prisma.user.create({
      data: {
        email: data.email,
        secret: data.secret,
        role: 'GROUP',
        group: {
          create: {
            companyEmail: data.email,
            companyName: payload.companyName,
            isActive: true,
          },
        },
      },
      include: {
        group: true,
      },
    });
  }
}
