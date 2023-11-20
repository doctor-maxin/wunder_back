import { Controller, Get } from '@nestjs/common';
import { AdvertisingService } from './advertising.service';

@Controller('integrations')
export class AdvertisingController {
  constructor(private advertisingService: AdvertisingService) {
    // this.getTestFetch()
  }

  async getTestFetch() {
    await this.advertisingService.updateState();
    const r = await this.advertisingService.getYandexDirectBalance(
      'BY',
      'by-paritetbank-wund-zachislen',
      '77038645',
    );
    console.log('TEST ', r);
  }
}
