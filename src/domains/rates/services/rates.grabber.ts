import { PrismaService } from '../../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { Rate } from '../entities/rate.entity';
import { SellRatesEntity } from '../entities/sell-rates.entity';
import {
  AlfaRatesList,
  EABList,
  EABToken,
} from '../../../integrations/alfabank/alfabank.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RatesGrabber {
  private rates: Rate[];
  private list: any[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  public async start(currency: string): Promise<SellRatesEntity> {
    if (currency === 'BYN') {
      return await this.fetchAlfaRates();
    } else {
      return await this.fetchEuroAsianRates();
    }
  }

  private async getEuroAsianToken() {
    const result = await this.httpService.axiosRef.post<EABToken>(
      'https://api.bcc.kz:10443/bcc/production/v2/oauth/token',
      {
        grant_type: 'client_credentials',
        client_id: process.env.EAB_ID,
        client_secret: process.env.EAB_SECRET,
        scope: 'bcc.application.informational.api',
      },
    );

    return result.data.access_token;
  }

  private async getEuroAsianList(token: string) {
    const result = await this.httpService.axiosRef.get<EABList>(
      'https://api.bcc.kz:10443/bcc/production/v1/public/rates',
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );
    return result.data.Rates;
  }

  public async fetchEuroAsianRates(): Promise<SellRatesEntity> {
    try {
      const token = await this.getEuroAsianToken();
      console.log('token', token);
      const list = await this.getEuroAsianList(token);
      return {
        sellUSD: list.find((i) => i.currency === 'USD')?.sell,
        sellEUR: list.find((i) => i.currency === 'EUR')?.sell,
        sellRUB: list.find((i) => i.currency === 'RUB')?.sell,
      };
    } catch (err: any) {
      console.log(err?.response?.data);
    }
  }

  public async fetchAlfaRates(): Promise<SellRatesEntity> {
    const allRates = await this.httpService.axiosRef.get<AlfaRatesList>(
      'https://developerhub.alfabank.by:8273/partner/1.0.1/public/rates',
    );
    const bynList = allRates.data.rates.filter((item) => item.buyIso === 'BYN');

    const rates = {
      sellRUB: 1,
      sellUSD: 1,
      sellEUR: 1,
    };

    for (const rate of bynList) {
      if (rate.sellIso === 'RUB') rates.sellRUB = rate.sellRate;
      if (rate.sellIso === 'USD') rates.sellUSD = rate.sellRate;
      if (rate.sellIso === 'EUR') rates.sellEUR = rate.sellRate;
    }

    return rates;
  }
}
