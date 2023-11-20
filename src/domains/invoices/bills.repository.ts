// import {Injectable} from "@nestjs/common";
// import {PrismaService} from "../../prisma/prisma.service";
// import {Account, Bill, BillLine, Prisma, System} from "@prisma/client";

// export type BillLineWithAccountSystem = BillLine & {
//     account: Account & {
//         system: System
//     }
// }
// @Injectable()
// export class BillsRepository {
//     constructor(private prisma: PrismaService) {
//     }

//     async bill({where}: {where: Prisma.BillWhereUniqueInput}): Promise<Bill | null> {
//         return this.prisma.bill.findUnique({where})
//     }

//     async bills({where, take, skip, include}: Prisma.BillFindManyArgs) {
//         let params: Prisma.BillFindManyArgs = {}
//         if (take) params.take = take;
//         if (where) params.where = where;
//         if (skip) params.skip = skip;
//         if (include) params.include = include;
//         return this.prisma.bill.findMany(params)
//     }

//     async billLines({where, include}: {where: Prisma.BillLineWhereInput, include?: Prisma.BillLineInclude}): Promise<BillLineWithAccountSystem[] | null> {
//         return this.prisma.billLine.findMany({where, include}) as unknown as BillLineWithAccountSystem[]
//     }
// }
