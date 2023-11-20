import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { URLSearchParams } from 'url';
import { RequirementsResult, Token } from './alfabank.types';

@Injectable()
export class AlfabankService {
  host: string;
  constructor(private httpService: HttpService) {
    this.host = 'https://developerhub.alfabank.by:8273';
  }

  async getToken() {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const data = new URLSearchParams({
      grant_type: 'password',
      username: 'API',
      client_id: process.env.ALFABANK_CLIENT_ID,
      client_secret: process.env.ALFABANK_CLIENT_SECRET,
      scope: 'accounts profile ',
    });
    const token = await this.httpService.axiosRef.post(
      this.host + '/token',
      data.toString(),
      config,
    );
    console.log('Token', token.data);
    return token.data;
  }

  async refreshToken(tokens) {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ALFABANK_CLIENT_ID,
      client_secret: process.env.ALFABANK_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
    });
    const token = await this.httpService.axiosRef.post(
      this.host + '/token',
      data.toString(),
      config,
    );
    console.log(token.data);
    return token.data;
  }

  async getRequirements(
    token: Token,
    fromDate?: Date,
    customerNumber?: string,
  ) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `${token.token_type} ${token.access_token}`,
        },
      };
      const data = new URLSearchParams({
        dateFrom: fromDate
          ? fromDate.toLocaleDateString('ru-RU')
          : new Date().toLocaleDateString('ru-RU'),
        pageRowCount: '30',
      });
      if (customerNumber) data.set('number', customerNumber);
      const result = await this.httpService.axiosRef.get<RequirementsResult>(
        `${this.host}/partner/1.0.3/documents/requirements?${data.toString()}`,
        config,
      );
      return result.data;
    } catch (e) {
      console.error(e);
    }
  }
}
