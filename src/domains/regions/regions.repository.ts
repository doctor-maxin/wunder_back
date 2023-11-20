import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ContactEntity } from './entity/contact.entity';
import { IRegion } from '../../common/interfaces/region.interface';
import { IContact } from '../../common/interfaces/user.interface';
import { RegionWithSettings } from './entity/region-with-settings.entity';

@Injectable()
export class RegionsRepository {
  constructor(private prisma: PrismaService) {}

  public async regionByName(name: string): Promise<IRegion> {
    return this.prisma.region.findUnique({ where: { name } });
  }

  public async regions(): Promise<IRegion[]> {
    return this.prisma.region.findMany();
  }

  public async regionContact(id: number): Promise<IContact> {
    return this.prisma.contacts.findUnique({ where: { regionId: id } });
  }

  public async activeRegion(): Promise<IRegion> {
    return this.prisma.region.findFirst({ where: { isActive: true } });
  }

  public async create(data): Promise<IRegion> {
    return this.prisma.region.create({ data });
  }

  public async setSignFilename(regionId: number, sign: string): Promise<void> {
    await this.prisma.region.update({
      where: { id: regionId },
      data: {
        sign,
      },
    });
  }

  public async createEmptyContact(regionId: number): Promise<ContactEntity> {
    return this.prisma.contacts.create({
      data: {
        companyName: '',
        regionId: regionId,
      },
    });
  }

  public async regionWithSettings(): Promise<RegionWithSettings[]> {
    return this.prisma.region.findMany({
      include: {
        settings: true,
        systemSettings: {
          include: {
            lines: true,
          },
        },
        contacts: true,
      },
    });
  }

  public async disableAll(id: number): Promise<void> {
    await this.prisma.region.updateMany({
      where: {
        NOT: {
          id,
        },
      },
      data: {
        isActive: false,
      },
    });
  }
}
