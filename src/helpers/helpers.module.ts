import { Global, Module } from "@nestjs/common";
import { ValidatorService } from "./validator.service";
import { RubleHelperService } from "./ruble.service";
import { TengeHelperService } from "./tenge.service";

@Global()
@Module({
    providers: [ValidatorService, RubleHelperService, TengeHelperService],
    exports: [ValidatorService, RubleHelperService, TengeHelperService],
})
export class HelpersModule {}
