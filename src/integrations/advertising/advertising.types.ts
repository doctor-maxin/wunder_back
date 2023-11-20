export interface IntegrationItem {
  internal_id: number;
  name: string;
  status: 'valid' | 'invalid';
  data: string;
}

export interface GoogleAdsTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}
export interface GoogleAdsTokenRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export interface GoogleAdsBudget<T> {
  results: T[];
  fieldMask: string;
  requestId: string;
}
export interface GoogleAdsBalanceQuery {
  customer: {
    resourceName: string;
    currencyCode: string;
  };
  accountBudget: {
    resourceName: string;
    adjustedSpendingLimitMicros: string;
    amountServedMicros: string;
  };
}

export interface GoogleAdsQuery {
  customer: {
    resourceName: string;
    id: string;
    currencyCode: string;
  };
  metrics: {
    costMicros: string;
  };
}
export interface GoogleAdsBudgetRequest {
  query: string;
}

export interface YandexDriveBudgetInfoResponse {
  data: {
    ActionsResult: any[];
    Accounts: YandexDriveAccount[];
  };
}
export interface YandexDriveAccount {
  Amount: string;
  AmountAvailableForTransfer: string;
  Discount: number;
  EmailNotification: {
    PausedByDayBudget: string;
    MoneyWarningValue: number;
    Email: string;
    SendWarn: any;
  };
  SmsNotification: {
    MoneyOutSms: string;
    SmsTimeTo: string;
    PausedByDayBudgetSms: string;
    MoneyInSms: string;
    SmsTimeFrom: string;
  };
  AgencyName: string;
  Login: string;
  AccountID: number;
  Currency: string;
}
export interface YandexDirectBudgetInfoRequest {
  method: string;
  token: string;
  param: {
    Action: string;
    SelectionCriteria: {
      Logins: string[];
    };
  };
}
export interface TikTokResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    advertiser_account_list: TokTokAccount[];
    page_info: TokTokPage;
  };
}
interface TokTokAccount {
  advertiser_type: string;
  valid_grant_balance: number;
  recharge_count: number;
  latest_recharge_time: string;
  first_recharge_amount: number;
  advertiser_status: string;
  timezone: string;
  currency: string;
  grant_balance: number;
  valid_account_balance: number;
  frozen_balance: number;
  company: string;
  advertiser_id: string;
  balance_reminder: boolean;
  valid_cash_balance: number;
  first_recharge_time: string;
  account_balance: number;
  transferable_amount: number;
  contact_name: string;
  create_time: string;
  tax: number;
  account_open_days: number;
  advertiser_name: string;
  recharge_amount: number;
  contact_email: string;
  cash_balance: number;
}
interface TokTokPage {
  total_page: number;
  page: number;
  page_size: number;
  total_number;
}
export interface MetaResponse {
  balance: string | number;
  currency: string;
}

export interface MyTargetResponse {
  count: number;
  items: MyTargetItem[];
  limit: number;
  offset: number;
}
interface MyTargetItem {
  access_type: string;
  status: string;
  user: MyTargetUser;
}
interface MyTargetUser {
  account: {
    a_balance: string;
    balance: string;
    currency: string;
    currency_balance_hold: string;
    flags: string[];
    id: number;
    is_nonresident: boolean;
    type: string;
  };
  additional_emails: string[];
  additional_info: {
    address: string;
    client_info: string;
    client_name: string;
    email: string;
    name: string;
    phone: string;
  };
  client_username: string;
  id: number;
  status: string;
  types: string[];
  username: string;
}
