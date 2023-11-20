import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RegionsRepository } from '../../regions/regions.repository';
import { RatesGrabber } from './rates.grabber';
import * as moment from 'moment/moment';
import { SellRatesEntity } from '../entities/sell-rates.entity';
import { RatesFilters } from '../entities/rates-filters.entity';
import { RatesRepository } from '../rates.respository';
import { RateEntity } from '../entities/rate.entity';

@Injectable()
export class RatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionRepository: RegionsRepository,
    private readonly grabber: RatesGrabber,
    private readonly ratesRepository: RatesRepository,
  ) {}

  public async getList(params: RatesFilters): Promise<[number, RateEntity[]]> {
    return Promise.all([
      this.ratesRepository.getCount(params),
      this.ratesRepository.getList(params),
    ]);
  }

  public async findAll(): Promise<SellRatesEntity> {
    const region = await this.regionRepository.activeRegion();

    if (region.name === 'KZ') {
      const rates = await this.getRatesByDates(region.currency);

      return rates ? rates : new SellRatesEntity();
    } else if (region.name === 'BY') {
      return this.grabber.fetchAlfaRates();
    }
    return new SellRatesEntity();
  }

  private async getRatesByDates(
    currency: string,
  ): Promise<SellRatesEntity | void> {
    let rates: any;
    for (let i = 0; i < 5; i++) {
      let date: any = new Date();
      date.setHours(0, 0);
      date.setDate(date.getDate() - i);
      date = moment.utc(date).toISOString();

      const r = await this.prisma.rates.findFirst({
        where: {
          fromRate: currency,
          date: {
            gte: date,
          },
        },
      });
      if (r) {
        rates = {
          sellRUB: parseFloat(r.rubRate),
          sellUSD: parseFloat(r.usdRate),
          sellEUR: parseFloat(r.eurRate),
        };
        break;
      }
    }
    if (rates) {
      return rates;
    }
  }

  public async fetch(): Promise<any> {
    const region = await this.regionRepository.activeRegion();

    return this.grabber.start(region.currency);
  }
}
