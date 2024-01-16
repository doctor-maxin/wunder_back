import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AccumulativeDiscountRepository {
    constructor(private readonly prisma: PrismaService) { }

    public async getList(contractId: number) {
        return this.prisma.accumulativeDiscount.findMany({
            where: {
                contractId
            }
        })
    }

    public async create(data: any) {
        return this.prisma.accumulativeDiscount.create({
            data: {
                amount: Number(data.amount),
                discount: Number(data.discount),
                period: data.period,
                system: data.system,
                contract: {
                    connect: {
                        id: data.contractId
                    }
                }
            }
        })
    }
}