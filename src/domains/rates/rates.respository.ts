import { Injectable } from '@nestjs/common';
import { RatesFilters } from './entities/rates-filters.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { IRate } from '../../common/interfaces/rate.interface';

@Injectable()
export class RatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getCount(params: RatesFilters): Promise<number> {
    return this.prisma.rates.count();
  }
  public async getList(params: RatesFilters): Promise<IRate[]> {
    return this.prisma.rates.findMany({
      skip: params.skip,
      take: params.limit,
      orderBy: {
        date: 'desc',
      },
    });
  }
}
