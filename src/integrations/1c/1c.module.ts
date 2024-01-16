import { Module } from "@nestjs/common";
import { OneCController } from "./1c.controller";

@Module({
    providers: [],
    controllers: [OneCController],
})
export class OneCModule {
}