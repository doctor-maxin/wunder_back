import { ApiProperty, IntersectionType, PickType, getSchemaPath } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsObject, IsString } from "class-validator";
import { ContactEntity } from "../../../domains/regions/entity/contact.entity";
import { ContractEntity } from "../../../domains/contracts/entity/contract.entity";
import { SystemName } from "../../../domains/systems/entity/system.entity";
import { CustomerEntity } from "../../../domains/users/entity/customer.entity";

export class GenerateBillLineDto {
    @ApiProperty({
        example: SystemName.GoogleAds,
        title: 'Наименование системы',
        enum: Object.values(SystemName),
        description: 'Намиенование системы, где расположен аккаунт',
    })
    @IsString()
    system: SystemName;

    @ApiProperty({
        title: 'Тип рекламы',
        example: 'контекстная',
        enum: ['контекстная', 'таргетированная'],
        description: 'Тип рекламы в системе',
    })
    @IsString()
    type: string;

    @ApiProperty({
        title: 'Наименование аккаунта',
        example: 'MyDream',
        description: 'Наименование аккаунта',
    })
    @IsString()
    name: string;

    @ApiProperty({
        title: 'Сумма',
        description: 'Сумма позиций с НДС'
    })
    @IsNumber()
    sum: number;

    @ApiProperty({
        title: 'НДС',
        example: 20,
        description: 'Величина НДС в %'
    })
    @IsNumber()
    vat: number;

    @ApiProperty({
        title: 'Сумма НДС',
        description: 'Величина суммы НДС в позиции'
    })
    @IsNumber()
    totalVat: number;

    @ApiProperty({
        title: 'Итого',
        example: 20,
        description: 'Сумма позици с НДС'
    })
    @IsNumber()
    total: number;
}

export class GenerateBillDto {

    @ApiProperty({
        title: 'ID',
        example: 1,
        description: 'Идентификатор платежа'
    })
    @IsNumber()
    id: number;

    @IsString()
    @ApiProperty({
        title: 'Номер счета',
        example: '8/2023',
        description: 'Номер счета, сбрасывается каждый платежный период'
    })
    invoiceNumber: string;


    @ApiProperty({
        title: 'Данные компании'
    })
    contacts: ContactEntity;

    @ApiProperty({
        title: 'Изображение подписи',
        description: 'Путь до изображения подписи/печати'
    })
    @IsString()
    signImageUri: string;

    @IsNumber()
    @ApiProperty({
        title: 'НДС',
        description: 'Глобальный или уникальный НДС в зависимости от типа договора клиента'
    })
    vat: number;

    @ApiProperty({
        title: 'Сумма счета',
        description: 'Сумма счета включая НДС'
    })
    @IsNumber()
    total: number;

    @ApiProperty({
        title: 'Сумма НДС',
        description: 'Сумма НДС в платеже'
    })
    @IsNumber()
    totalVat: number;

    @ApiProperty({
        title: 'Время',
        description: 'Время создания счета'
    })
    @IsDateString()
    createdAt: string;

    @ApiProperty({
        title: '',
        description: '',
        type: IntersectionType(PickType(ContractEntity, ['contractType', 'contractNumber'] as const))
    })
    @IsObject()
    contract: Pick<ContractEntity, 'contractNumber' | 'contractType'>;

    @ApiProperty({
        title: 'Позиции',
        type: [GenerateBillLineDto]
    })
    lines: GenerateBillLineDto[];

    @ApiProperty({
        title: 'Клиент',
        description: 'Информация о клиенте',
        type: IntersectionType(PickType(CustomerEntity, ['companyName', 'companyTaxNumber', 'companyAddress', 'accountNumber', 'bankName', 'BIC'] as const))
    })
    customer: Pick<CustomerEntity, 'companyAddress' | 'companyName' | 'companyTaxNumber' | 'accountNumber' | 'bankName' | 'BIC'>

}