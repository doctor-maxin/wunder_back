import { Injectable } from '@nestjs/common';
import { SystemEntity } from './entity/system.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getSystem(name: string): Promise<SystemEntity> {
    return this.prisma.system.findUniqueOrThrow({
      where: {
        name,
      },
    });
  }

  public async getList(): Promise<SystemEntity[]> {
    return this.prisma.system.findMany();
  }
}
