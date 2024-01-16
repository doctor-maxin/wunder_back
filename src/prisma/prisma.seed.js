"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcryptjs");
var system_entity_1 = require("../domains/systems/entity/system.entity");
var prisma = new client_1.PrismaClient();
function createRegionSettings() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, prisma.settings.upsert({
                    where: { id: 1 },
                    update: { projectId: parseInt(process.env.PROJECT_ID) },
                    create: {
                        emailFrom: 'Platform Wunder',
                        projectId: parseInt(process.env.PROJECT_ID),
                    },
                })];
        });
    });
}
function createRegion(settingsId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, prisma.region.upsert({
                    where: { name: process.env.DEFAULT_REGION },
                    update: {},
                    create: {
                        name: process.env.DEFAULT_REGION,
                        settings: {
                            connect: { id: settingsId },
                        },
                        currency: process.env.DEFAULT_CURRENCY,
                        contacts: {
                            create: {
                                companyName: '-',
                                accountNumber: '-',
                                bankName: '-',
                                BIC: '-',
                                companyAddress: '-',
                                companyTaxNumber: '-',
                                contactName: 'Тестовое имя',
                            },
                        },
                        sign: '',
                        isActive: true,
                    },
                })];
        });
    });
}
function createAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var secret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bcrypt.hash(process.env.ADMIN_PASSWORD, 10)];
                case 1:
                    secret = _a.sent();
                    return [2 /*return*/, prisma.user.upsert({
                            where: { email: process.env.ADMIN_EMAIL },
                            update: {},
                            create: {
                                email: process.env.ADMIN_EMAIL,
                                secret: secret,
                                role: client_1.Role.ADMIN,
                                admin: {
                                    create: {
                                        name: 'Super Admin',
                                    },
                                },
                            },
                        })];
            }
        });
    });
}
function createSystems() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all([
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.GoogleAds },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.GoogleAds,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.YandexDirect },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.YandexDirect,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.Twitter },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.Twitter,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.YandexNavigator },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.YandexNavigator,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.TikTok },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.TikTok,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.Facebook },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.Facebook,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.MyTarget },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.MyTarget,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.DV360 },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.DV360,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.VK },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.VK,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.OK },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.OK,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.LinkedIn },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.LinkedIn,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.YandexView },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.YandexView,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.AppleSearch },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.AppleSearch,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.Telegram },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.Telegram,
                        },
                    }),
                    prisma.system.upsert({
                        where: { name: system_entity_1.SystemName.Kaspi },
                        update: {},
                        create: {
                            name: system_entity_1.SystemName.Kaspi,
                        },
                    }),
                ])];
        });
    });
}
function createSystemSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var systems, regions, _i, systems_1, system, _a, regions_1, region, regionId, systemName;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma.system.findMany()];
                case 1:
                    systems = _b.sent();
                    return [4 /*yield*/, prisma.region.findMany()];
                case 2:
                    regions = _b.sent();
                    _i = 0, systems_1 = systems;
                    _b.label = 3;
                case 3:
                    if (!(_i < systems_1.length)) return [3 /*break*/, 8];
                    system = systems_1[_i];
                    _a = 0, regions_1 = regions;
                    _b.label = 4;
                case 4:
                    if (!(_a < regions_1.length)) return [3 /*break*/, 7];
                    region = regions_1[_a];
                    regionId = region.id;
                    systemName = system.name;
                    return [4 /*yield*/, prisma.systemSettings.upsert({
                            where: { regionId_systemName: { regionId: regionId, systemName: systemName } },
                            update: {},
                            create: {
                                system: { connect: { id: system.id } },
                                region: { connect: { id: region.id } },
                            },
                        })];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var settings, region, admin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createRegionSettings()];
                case 1:
                    settings = _a.sent();
                    return [4 /*yield*/, createRegion(settings.id)];
                case 2:
                    region = _a.sent();
                    return [4 /*yield*/, createAdmin()];
                case 3:
                    admin = _a.sent();
                    console.log('admin', admin);
                    return [4 /*yield*/, createSystems()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, createSystemSettings()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
