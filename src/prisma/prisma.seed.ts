import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { SystemName } from '../domains/systems/entity/system.entity';

const prisma = new PrismaClient();

async function createRegionSettings() {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: { projectId: parseInt(process.env.PROJECT_ID) },
    create: {
      emailFrom: 'Platform Wunder',
      projectId: parseInt(process.env.PROJECT_ID),
    },
  });
}

async function createRegion(settingsId: number) {
  return prisma.region.upsert({
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
  });
}

async function createAdmin() {
  const secret = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  return prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      secret,
      role: Role.ADMIN,
      admin: {
        create: {
          name: 'Super Admin',
        },
      },
    },
  });
}

async function createSystems() {
  return Promise.all([
    prisma.system.upsert({
      where: { name: SystemName.GoogleAds },
      update: {},
      create: {
        name: SystemName.GoogleAds,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.YandexDirect },
      update: {},
      create: {
        name: SystemName.YandexDirect,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.Twitter },
      update: {},
      create: {
        name: SystemName.Twitter,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.YandexNavigator },
      update: {},
      create: {
        name: SystemName.YandexNavigator,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.TikTok },
      update: {},
      create: {
        name: SystemName.TikTok,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.Facebook },
      update: {},
      create: {
        name: SystemName.Facebook,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.MyTarget },
      update: {},
      create: {
        name: SystemName.MyTarget,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.DV360 },
      update: {},
      create: {
        name: SystemName.DV360,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.VK },
      update: {},
      create: {
        name: SystemName.VK,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.OK },
      update: {},
      create: {
        name: SystemName.OK,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.LinkedIn },
      update: {},
      create: {
        name: SystemName.LinkedIn,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.YandexView },
      update: {},
      create: {
        name: SystemName.YandexView,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.AppleSearch },
      update: {},
      create: {
        name: SystemName.AppleSearch,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.Telegram },
      update: {},
      create: {
        name: SystemName.Telegram,
      },
    }),
    prisma.system.upsert({
      where: { name: SystemName.Kaspi },
      update: {},
      create: {
        name: SystemName.Kaspi,
      },
    }),
  ]);
}

async function createSystemSettings() {
  const systems = await prisma.system.findMany();
  const regions = await prisma.region.findMany();

  for (const system of systems) {
    for (const region of regions) {
      const regionId = region.id;
      const systemName = system.name;
      await prisma.systemSettings.upsert({
        where: { regionId_systemName: { regionId, systemName } },
        update: {},
        create: {
          system: { connect: { id: system.id } },
          region: { connect: { id: region.id } },
        },
      });
    }
  }
}

async function main() {
  const settings = await createRegionSettings();
  const region = await createRegion(settings.id);
  const admin = await createAdmin();
  await createSystems();
  await createSystemSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
