import { Inject, Injectable } from '@nestjs/common';
import type { Cache, MemoryStore } from 'cache-manager';
import { memoryStore } from 'cache-manager';
import type { Client } from 'pg';
import { Client as PGClient } from 'pg';
import {
  GoogleAdsBalanceQuery,
  GoogleAdsBudget,
  GoogleAdsBudgetRequest,
  GoogleAdsQuery,
  GoogleAdsTokenRequest,
  GoogleAdsTokenResponse,
  IntegrationItem,
  MetaResponse,
  MyTargetResponse,
  TikTokResponse,
  YandexDirectBudgetInfoRequest,
  YandexDriveBudgetInfoResponse,
} from './advertising.types';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AdvertisingService {
  client: Client;
  blackList: string[];
  memoryCache: MemoryStore;

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.blackList = [
      'ALLUSERSPROFILE',
      'APPDATA',
      'COMMONPROGRAMFILES',
      'COMMONPROGRAMFILES(X86)',
      'COMMONPROGRAMW6432',
      'COMPUTERNAME',
      'COMSPEC',
      'DRIVERDATA',
      'FPS_BROWSER_APP_PROFILE_STRING',
      'FPS_BROWSER_USER_PROFILE_STRING',
      'HOMEDRIVE',
      'HOMEPATH',
      'IDEA_INITIAL_DIRECTORY',
      'LOCALAPPDATA',
      'LOGONSERVER',
      'NUMBER_OF_PROCESSORS',
      'ONEDRIVE',
      'ONEDRIVECONSUMER',
      'OS',
      'PATH',
      'PATHEXT',
      'PROCESSOR_ARCHITECTURE',
      'PROCESSOR_IDENTIFIER',
      'PROCESSOR_LEVEL',
      'PROCESSOR_REVISION',
      'PROGRAMDATA',
      'PROGRAMFILES',
      'PROGRAMFILES(X86)',
      'PROGRAMW6432',
      'PROMPT',
      'PSMODULEPATH',
      'PUBLIC',
      'PYCHARM_HOSTED',
      'PYTHONIOENCODING',
      'PYTHONPATH',
      'PYTHONUNBUFFERED',
      'SESSIONNAME',
      'SYSTEMDRIVE',
      'SYSTEMROOT',
      'TEMP',
      'TMP',
      'USERDOMAIN',
      'USERDOMAIN_ROAMINGPROFILE',
      'USERNAME',
      'USERPROFILE',
      'VBOX_MSI_INSTALL_PATH',
      'VIRTUAL_ENV',
      'WINDIR',
      '_OLD_VIRTUAL_PATH',
      '_OLD_VIRTUAL_PROMPT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'ECHO_MODE',
      'CHECK_VALUE',
      'PUBLIC_KEY',
      'PRIVATE_KEY',
    ];
  }

  async updateState() {
    try {
      let rows = await this.getTable(process.env.INTEGRATIONS_TABLE);
      if (Array.isArray(rows)) {
        rows = rows.filter((item) => this.filterBlackList(item));
        this.memoryCache = memoryStore({ ttl: 3600000 });
        await Promise.all(
          rows.map((row) =>
            this.memoryCache.set(row.name.toLowerCase(), row.data),
          ),
        );
      }
    } catch (e) {
      console.error(e.response);
    }
  }

  filterBlackList(row: IntegrationItem) {
    return !this.blackList.find((key) => row.name.includes(key));
  }

  async getTable(tableName: string): Promise<IntegrationItem[]> {
    try {
      const client = new PGClient({
        connectionString: process.env.REMOTE_DATABASE_URL,
      });
      await client.connect();

      const result = await client.query(`select * from ${tableName}`);
      await client.end();

      return result.rows.map((row) => {
        const data = Buffer.from(row.data, 'base64');
        return {
          ...row,
          data: data.toString('ascii'),
        };
      });
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  async getGoogleAdsToken(
    appId: string,
    appSecret: string,
    refreshToken: string,
  ): Promise<string> {
    const payload = {
      grant_type: 'refresh_token',
      client_id: appId,
      client_secret: appSecret,
      refresh_token: refreshToken,
    };
    const response = await this.httpService.axiosRef.post<
      GoogleAdsTokenRequest,
      AxiosResponse<GoogleAdsTokenResponse>
    >('https://www.googleapis.com/oauth2/v3/token', payload);
    return response.data.access_token;
  }
  async getGoogleAdsTotal(
    cabinetId: string,
    clientId: string,
    developerToken: string,
    accessToken: string,
  ) {
    const payload = {
      query: `SELECT 
                  metrics.cost_micros,
                  customer.id, 
                  customer.currency_code 
                FROM customer 
                WHERE 
                  customer.id = ${clientId}`,
    };
    const response = await this.httpService.axiosRef.post<
      GoogleAdsBudgetRequest,
      AxiosResponse<GoogleAdsBudget<GoogleAdsQuery>[]>
    >(
      `https://googleads.googleapis.com/v13/customers/${clientId}/googleAds:searchStream`,
      payload,
      {
        headers: {
          Authorization: accessToken,
          'developer-token': developerToken,
          'login-customer-id': cabinetId,
        },
      },
    );
    return response.data[0].results[0];
  }
  async getGoogleAdsBalanceRequest(
    cabinetId: string,
    clientId: string,
    budgetId: string,
    developerToken,
    accessToken,
  ) {
    try {
      console.log(cabinetId, clientId, budgetId);
      const response = await this.httpService.axiosRef.post<
        GoogleAdsBudgetRequest,
        AxiosResponse<GoogleAdsBudget<GoogleAdsBalanceQuery>[]>
      >(
        `https://googleads.googleapis.com/v13/customers/${clientId}/googleAds:searchStream`,
        {
          query: `SELECT 
                account_budget.adjusted_spending_limit_micros, 
                  account_budget.amount_served_micros, 
                  customer.currency_code
                  FROM
                  account_budget 
                WHERE
                  account_budget.id = ${budgetId}
            `,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': developerToken,
            'login-customer-id': cabinetId,
          },
        },
      );
      const result = response.data[0].results[0];
      const budgetLimit =
        parseFloat(result.accountBudget.adjustedSpendingLimitMicros) / 1000000;
      const budgetCost =
        parseFloat(result.accountBudget.amountServedMicros ?? '0') / 1000000;
      return {
        currency: result.customer.currencyCode,
        balance: Math.round(budgetLimit - budgetCost).toLocaleString('ru'),
      };
    } catch (err) {
      console.dir(err.response.data, {
        depth: 10,
      });
      return {
        currency: 'BYN',
        balance: 0,
      };
    }
  }

  async getYandexDriveBudgetInfo(
    accessToken: string,
    clientLogin: string,
    accountId: number | string,
  ) {
    const response = await this.httpService.axiosRef.post<
      YandexDirectBudgetInfoRequest,
      AxiosResponse<YandexDriveBudgetInfoResponse>
    >('https://api.direct.yandex.ru/live/v4/json/', {
      method: 'AccountManagement',
      token: accessToken,
      param: {
        Action: 'Get',
        SelectionCriteria: {
          Logins: [clientLogin],
        },
      },
    });
    const result = response.data.data.Accounts;
    const account = result.find((acc) => acc.AccountID === Number(accountId));
    console.log(account);
    if (account) {
      return {
        currency: account.Currency,
        balance: account.AmountAvailableForTransfer,
      };
    }
    return null;
  }

  async getTikTokBadgetBalance(
    accessToken: string,
    accountId: string,
    region: string,
  ) {
    let bc_id = null;
    switch (region) {
      case 'KZ':
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        bc_id = 7005407250458132481;
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
        bc_id = 6961351620961533953;
    }
    const response = await this.httpService.axiosRef.get<TikTokResponse>(
      `https://business-api.tiktok.com/open_api/v1.3/advertiser/balance/get/?filtering={"keyword":"${accountId}"}`,
      {
        headers: {
          'access-token': accessToken,
          content_type: 'application/json',
        },
        params: {
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          bc_id: 6961351620961533953,
        },
      },
    );
    if (response.data.data.advertiser_account_list[0]) {
      return {
        balance:
          response.data.data.advertiser_account_list[0].valid_account_balance,
        currency: response.data.data.advertiser_account_list[0].currency,
      };
    }
    return null;
  }

  async getMetaBudgetInfo(accessToken: string, accountid: string) {
    const accountId = accountid.startsWith('act_')
      ? accountid
      : 'act_' + accountid;
    const response = await this.httpService.axiosRef.get<MetaResponse>(
      `https://graph.facebook.com/v15.0/${accountId}`,
      {
        params: {
          access_token: accessToken,
          fields: 'balance,currency',
        },
      },
    );
    return response.data;
  }

  async getMyTargetBudgetInfo(accessToken: string, clientId: string) {
    const response = await this.httpService.axiosRef.get<MyTargetResponse>(
      'https://target.my.com/api/v2/agency/clients.json',
      {
        params: {
          limit: 1,
          _user__username: clientId,
        },
      },
    );
    if (response.data.count > 0) {
      const result = response.data.items[0].user;
      return {
        currency: result.account.currency,
        balance: result.account.balance,
      };
    }
  }

  async getVKBadgetInfo(
    accessToken: string,
    clientid: string,
    agencyId: string,
  ) {
    // const response =
    //    TODO: GET VK BALANCE
  }

  async getGoogleAdsBalance(
    agencyId: string,
    clientId: string,
    accountId: string,
  ) {
    const appId = await this.memoryCache.get<string>('g_client_id');
    const appSecret = await this.memoryCache.get<string>('g_client_secret');
    const clientRefreshToken = await this.memoryCache.get<string>(
      'g_refresh_token',
    );
    const developerToken = await this.memoryCache.get<string>(
      'g_ads_dev_token',
    );
    const accessToken = await this.getGoogleAdsToken(
      appId,
      appSecret,
      clientRefreshToken,
    );
    // const amount = await this.getGoogleAdsTotal(cabinetId, clientId, developerToken, accessToken)
    return await this.getGoogleAdsBalanceRequest(
      agencyId,
      clientId,
      accountId,
      developerToken,
      accessToken,
    );
  }

  async getYandexDirectBalance(
    region: string,
    clientLogin: string,
    accountId: string,
  ) {
    const accessToken = await this.memoryCache.get<string>(
      `yd_${region.toLowerCase()}_access_token`,
    );
    return await this.getYandexDriveBudgetInfo(
      accessToken,
      clientLogin,
      accountId,
    );
  }

  async getTikTokBalance(region: string, clientId: string) {
    const accessToken = await this.memoryCache.get<string>(
      `tt_${region.toLowerCase()}_access_token`,
    );
    return await this.getTikTokBadgetBalance(accessToken, clientId, region);
  }

  async getMetaBalance(clientId: string) {
    const accessToken = await this.memoryCache.get<string>(`fb_access_token`);
    return await this.getMetaBudgetInfo(accessToken, clientId);
  }

  async getMyTargetBalance(clientId: string) {
    const accessToken = await this.memoryCache.get<string>('mt_access_token');
    return await this.getMyTargetBudgetInfo(accessToken, clientId);
  }

  async getVKBalance(cliendId: string) {
    const accessToken = await this.memoryCache.get<string>('vk_access_token');
    const agencyId = await this.memoryCache.get<string>('vk_agency_account_id');
    return await this.getVKBadgetInfo(accessToken, cliendId, agencyId);
  }
}
