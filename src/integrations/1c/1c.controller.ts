import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GenerateDocumentResponse } from "./dto/generate-document.dto";
import { GenerateBillDto } from "./dto/generate-bill.dto";

@Controller('1c')
@ApiTags('1C')
export class OneCController {

    @Post('/generate-invoice')
    @ApiOperation({
        summary: 'Создание счета на оплату',
    })
    @ApiOkResponse({ type: GenerateDocumentResponse })
    public async generateInvoice(@Body() body: GenerateBillDto): Promise<GenerateDocumentResponse> {
        return new GenerateDocumentResponse()
    }

    @Post('/generate-signed-invoice')
    @ApiOperation({
        summary: 'Создание подписанного счета на оплату',
    })
    @ApiOkResponse({ type: GenerateDocumentResponse })
    public async generateSignedInvoice(@Body() body: GenerateBillDto): Promise<GenerateDocumentResponse> {
        return new GenerateDocumentResponse()
    }

    @Post('/generate-signed-act')
    @ApiOperation({
        summary: 'Создание подписанного акта',
    })
    @ApiOkResponse({ type: GenerateDocumentResponse })
    public async generateSignedAct(@Body() body: GenerateBillDto): Promise<GenerateDocumentResponse> {
        return new GenerateDocumentResponse()
    }

    @Post('/generate-act')
    @ApiOperation({
        summary: 'Создание акта по платежу',
    })
    @ApiOkResponse({ type: GenerateDocumentResponse })
    public async generateAct(@Body() body: GenerateBillDto): Promise<GenerateDocumentResponse> {
        return new GenerateDocumentResponse()
    }
}