// import {
//     BadRequestException,
//     Body,
//     Controller,
//     Delete,
//     Get,
//     Param,
//     Post,
//     Put,
//     Query,
//     UploadedFile,
//     UseInterceptors,
// } from "@nestjs/common";
// import { BillsService } from "./bills.service";
// import { Filters } from "../common/types/Filters";
// import { Bill, Prisma } from "@prisma/client";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import { join } from "path";
// import {AdminOnly} from "../common/decorators/admin-only.decorator";
//
// @Controller("bills")
// export class BillsController {
//     constructor(private billsService: BillsService) {}
//
//     @Post("/acts/upload")
//     @UseInterceptors(
//         FileInterceptor("file", {
//             storage: diskStorage({
//                 destination: join(process.cwd(), "documents", "acts"),
//                 filename: (req, file, cb) => {
//                     file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
//
//                     const filename = file.originalname.split(".");
//                     const ext = filename.pop();
//                     cb(null, file.originalname);
//                 },
//             }),
//         })
//     )
//     async uploadActFile(@UploadedFile() file: Express.Multer.File) {
//         return file.filename;
//     }
//
//     @Post("/bill/upload")
//     @UseInterceptors(
//         FileInterceptor("file", {
//             storage: diskStorage({
//                 destination: join(process.cwd(), "documents", "bills"),
//                 filename: (req, file, cb) => {
//                     file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
//
//                     const filename = file.originalname.split(".");
//                     const ext = filename.pop();
//                     cb(null, `${filename.join(".") + "-" + Date.now()}.${ext}`);
//                 },
//             }),
//         })
//     )
//     async uploadBillFile(@UploadedFile() file: Express.Multer.File) {
//         return file.filename;
//     }
//
//     @Get("/acts")
//     async getActsByCustomerId(
//         @Query("customerId") customerId: string,
//         @Query("filters") filtersString: string
//     ) {
//         const parsedCustomerId = parseInt(customerId);
//         if (isNaN(parsedCustomerId)) {
//             throw new BadRequestException();
//         }
//         const filters: Filters = JSON.parse(filtersString);
//
//         let params = {
//             take: filters.limit,
//             skip: filters.skip,
//             where: {
//                 customerId: parsedCustomerId,
//                 OR: undefined,
//                 contractId: undefined,
//                 createdAt: undefined,
//             },
//             include: {
//                 bill: {
//                     include: {
//                         lines: {
//                             include: {
//                                 account: {
//                                     include: {
//                                         system: true,
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//                 signedDocument: true,
//             },
//         };
//         if (filters.query) {
//             params.where.OR = [
//                 { bill: { number: { contains: filters.query } } },
//             ];
//             if (!isNaN(parseFloat(filters.query))) params.where.OR.push({
//                 total: { equals: parseFloat(filters.query) }
//             })
//         }
//         if (filters.contract) {
//             params.where.contractId = filters.contract;
//         }
//         if (filters.fromDate && filters.endDate) {
//             const [d, m, y] = filters.endDate.split("-");
//             const [d1, m1, y1] = filters.fromDate.split("-");
//             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
//             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
//             params.where.createdAt = {
//                 lte: endDate,
//                 gte: fromDate,
//             };
//             console.log(params.where);
//         } else if (filters.fromDate) {
//             const [d1, m1, y1] = filters.fromDate.split("-");
//             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
//             params.where.createdAt = {
//                 gte: fromDate,
//             };
//         } else if (filters.endDate) {
//             const [d, m, y] = filters.fromDate.split("-");
//             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
//             params.where.createdAt = {
//                 lte: endDate,
//             };
//         }
//         return await this.billsService.getActs(params);
//     }
//
//     @Get('/acts/report')
//     async reportActs(@AdminOnly() permission: any, @Query("filters") filtersString: string) {
//         const filters: Filters = JSON.parse(filtersString);
//         return this.billsService.getActsReport(filters)
//     }
//
//     @Get('/report')
//     async reportBills(@AdminOnly() permission: any, @Query("filters") filtersString: string) {
//         const filters: Filters = JSON.parse(filtersString);
//         return this.billsService.getBillsReport(filters)
//     }
//     @Post("/acts")
//     async generateAct(@Body() bill: Bill) {
//         return await this.billsService.generateAct(bill);
//     }
//
//     @Get("/")
//     async getAllByCustomerId(
//         @Query("customerId") customerId: string,
//         @Query("filters") filtersString: string
//     ) {
//         const parsedCustomerId = parseInt(customerId);
//         if (isNaN(parsedCustomerId)) {
//             throw new BadRequestException();
//         }
//         const filters: Filters = JSON.parse(filtersString);
//         let params = {
//             take: filters.limit,
//             skip: filters.skip,
//             where: {
//                 customerId: parsedCustomerId,
//                 OR: undefined,
//                 contractId: undefined,
//                 createdAt: undefined,
//             },
//             include: {
//                 lines: {
//                     include: {
//                         account: {
//                             include: {
//                                 system: true,
//                             },
//                         },
//                         task: true,
//                     },
//                 },
//                 systemLines: true,
//             },
//         };
//         if (filters.query) {
//             params.where.OR = [{ number: { contains: filters.query } }];
//         }
//         if (filters.contract) {
//             params.where.contractId = filters.contract;
//         }
//         if (filters.fromDate && filters.endDate) {
//             const [d, m, y] = filters.endDate.split("-");
//             const [d1, m1, y1] = filters.fromDate.split("-");
//             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
//             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
//             params.where.createdAt = {
//                 lte: endDate,
//                 gte: fromDate,
//             };
//             console.log(params.where);
//         } else if (filters.fromDate) {
//             const [d1, m1, y1] = filters.fromDate.split("-");
//             const fromDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
//             params.where.createdAt = {
//                 gte: fromDate,
//             };
//         } else if (filters.endDate) {
//             const [d, m, y] = filters.fromDate.split("-");
//             const endDate = new Date(Number(y), Number(m) - 1, Number(d));
//             params.where.createdAt = {
//                 lte: endDate,
//             };
//         }
//         return await this.billsService.getAll(params);
//     }
//
//     @Put("/")
//     async updateBill(@Body() bill: any) {
//         return await this.billsService.updateBill(bill);
//     }
//
//     @Put("/acts")
//     async updateAct(@Body() act: any) {
//         if (act.bill && act.bill.number) {
//             await this.billsService.updateBill(act.bill);
//         }
//         return await this.billsService.updateAct(act);
//     }
//     @Put('/acts/:id/visibility')
//     async changeActVisibility(@Body() data: {actId: number; value: boolean}) {
//         return this.billsService.changeActVisibility(data)
//     }
//
//     @Delete("/acts/:id")
//     async deleteAct(@Param("id") id: string) {
//         return await this.billsService.deleteAct(id);
//     }
//
//     @Delete("/:id")
//     async deleteBill(@Param("id") id: string) {
//         return await this.billsService.deleteBill(id);
//     }
// }
