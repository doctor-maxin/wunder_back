import {Injectable} from "@nestjs/common";
import {parsePhoneNumberFromString} from 'libphonenumber-js';
import {PrismaService} from '../prisma/prisma.service';

@Injectable()
export class ValidatorService{
    constructor(private prisma: PrismaService) {
    }
    async validatePhoneAsync(phone: string, region: string): Promise<boolean>{
        const parsed = parsePhoneNumberFromString(phone);
        if (!parsed) return false;
        return region === parsed.country;
    }

    async validateRegionAsync(region: string): Promise<boolean> {
        return !!(await this.prisma.region.findUnique({where: {name: region}}));
    }

    async validateSystemAsync(system: string): Promise<boolean> {
        return !!(await this.prisma.system.findUnique({where: {name: system}}));
    }
}