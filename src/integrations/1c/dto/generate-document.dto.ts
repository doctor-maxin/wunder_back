import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateDocumentResponse {
    @IsString()
    @ApiProperty({
        title: 'URL',
        description: 'Путь для скачивания файла'
    })
    url: string;
}