import { ApiProperty } from '@nestjs/swagger';
import { ISystem } from '../../../common/interfaces/settings.interface';
import { IsNumber, IsString } from 'class-validator';

export class SystemEntity implements ISystem {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;
}

export enum SystemName {
  YandexDirect = 'Яндекс Директ',
  YandexNavigator = 'Яндекс Навигатор',
  YandexView = 'Яндекс Взгляд',
  GoogleAds = 'Google Ads',
  TikTok = 'TikTok',
  Twitter = 'Twitter',
  Facebook = 'Facebook',
  MyTarget = 'MyTarget',
  DV360 = 'DV360',
  VK = 'VK',
  OK = 'OK',
  LinkedIn = 'LinkedIn',
  Telegram = 'Telegram',
  AppleSearch = 'Apple Search',
  Kaspi = 'Kaspi',
}
