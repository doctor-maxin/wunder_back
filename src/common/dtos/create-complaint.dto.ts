import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateComplaintDto {
    @ApiProperty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsString()
    theme: string;
}