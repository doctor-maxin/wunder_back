import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRateDto {
    @ApiProperty({ example: '6.16' })
    @IsString()
    eurRate: string;

    @ApiProperty({ example: '6.16' })
    @IsString()
    rubRate: string;

    @ApiProperty({ example: '6.16' })
    @IsString()
    usdRate: string;
}