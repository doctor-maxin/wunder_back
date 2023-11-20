-- CreateEnum
CREATE TYPE "SignedDocumentsStatus" AS ENUM ('WAITING', 'SIGNED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'GROUP');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('STANDARD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('PREPAY', 'POSTPAY', 'EXPENSES');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('NEW', 'PAID', 'CANCELED', 'AVOIDED', 'WAITING', 'SIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InvoiceDocumentType" AS ENUM ('BILL', 'ACT', 'SIGNED_BILL', 'SIGNED_ACT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "secret" VARCHAR(200),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sign" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BYN',
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rates" (
    "id" SERIAL NOT NULL,
    "fromRate" TEXT NOT NULL,
    "usdRate" TEXT NOT NULL,
    "rubRate" TEXT NOT NULL,
    "eurRate" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCandidate" (
    "id" SERIAL NOT NULL,
    "regionName" TEXT NOT NULL DEFAULT 'BY',
    "companyName" TEXT NOT NULL,
    "companyTaxNumber" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhoneNumber" TEXT NOT NULL,
    "taskId" INTEGER,
    "customerId" INTEGER,
    "publicAgree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerGroup" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "BIC" TEXT NOT NULL,
    "bankAddress" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyEmail" TEXT NOT NULL,
    "companyPhoneNumber" TEXT,
    "companyTaxNumber" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhoneNumber" TEXT NOT NULL,
    "postalAddress" TEXT NOT NULL,
    "responsiblePersonFullName" TEXT NOT NULL,
    "responsiblePersonPosition" TEXT NOT NULL,
    "signatureDocumentType" TEXT NOT NULL,
    "personalAgree" BOOLEAN DEFAULT false,
    "publicAgree" BOOLEAN DEFAULT false,
    "planFixId" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "emailFrom" TEXT NOT NULL DEFAULT 'Patform Wunder',
    "planFixManagerId" TEXT NOT NULL DEFAULT '',
    "financialManagerId" TEXT NOT NULL DEFAULT '',
    "telegramLink" TEXT NOT NULL DEFAULT '',
    "whatappText" TEXT,
    "whatappPhone" TEXT,
    "telPhone" TEXT,
    "regionId" INTEGER,
    "global" BOOLEAN NOT NULL DEFAULT false,
    "ratesAdds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeHours" INTEGER NOT NULL DEFAULT 0,
    "contractId" INTEGER,
    "freeTimes" INTEGER NOT NULL DEFAULT 0,
    "hourCost" MONEY NOT NULL DEFAULT 0,
    "vat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payType" "PayType" NOT NULL DEFAULT 'PREPAY',
    "allowTransfer" BOOLEAN NOT NULL DEFAULT true,
    "paymentWaitingHours" INTEGER NOT NULL DEFAULT 72,
    "balanceUpdateDelay" INTEGER NOT NULL DEFAULT 10,
    "projectId" INTEGER NOT NULL DEFAULT 0,
    "isEDNActive" BOOLEAN NOT NULL DEFAULT false,
    "is1CActive" BOOLEAN NOT NULL DEFAULT false,
    "customerId" INTEGER,
    "personalAgree" TEXT,
    "publicContract" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacts" (
    "id" SERIAL NOT NULL,
    "contactName" TEXT,
    "BIC" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "companyAddress" TEXT,
    "companyTaxNumber" TEXT,
    "companyName" TEXT NOT NULL,
    "regionId" INTEGER,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "systemName" TEXT NOT NULL,
    "regionId" INTEGER,
    "currency" TEXT DEFAULT 'BYN',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "minSum" MONEY NOT NULL DEFAULT 0,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SysemSettingsLine" (
    "id" SERIAL NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "fromAmount" DECIMAL(65,30) NOT NULL,
    "toAmount" DECIMAL(65,30) NOT NULL,
    "systemSettingsId" INTEGER NOT NULL,
    "systemName" TEXT DEFAULT '',

    CONSTRAINT "SysemSettingsLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SysemSettingsCustomerLine" (
    "id" SERIAL NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "fromAmount" DECIMAL(65,30) NOT NULL,
    "toAmount" DECIMAL(65,30) NOT NULL,
    "systemSettingsId" INTEGER NOT NULL,
    "systemName" TEXT DEFAULT '',

    CONSTRAINT "SysemSettingsCustomerLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerToSystemSettings" (
    "id" SERIAL NOT NULL,
    "systemName" TEXT NOT NULL,
    "customerId" INTEGER,
    "minSum" MONEY NOT NULL DEFAULT 0,
    "contractId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerToSystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "systemId" INTEGER NOT NULL,
    "email" TEXT,
    "accountName" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "externalClientId" TEXT,
    "externalAgency" TEXT,
    "externalRegion" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "contractId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "login" TEXT,
    "password" TEXT,
    "taskId" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "contractService" TEXT,
    "contractNumber" TEXT,
    "contractType" "ContractType" NOT NULL DEFAULT 'STANDARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settingsId" INTEGER NOT NULL DEFAULT 0,
    "expireDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "contractId" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "comment" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" INTEGER,
    "contractId" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'BYN',
    "invoiceNumber" TEXT NOT NULL DEFAULT '0',
    "lines" JSONB NOT NULL,
    "cachedSystemSettings" JSONB NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "hasOriginal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRates" (
    "id" SERIAL NOT NULL,
    "rubRate" TEXT NOT NULL DEFAULT '1',
    "eurRate" TEXT NOT NULL DEFAULT '1',
    "usdRate" TEXT NOT NULL DEFAULT '1',
    "invoiceId" INTEGER NOT NULL,

    CONSTRAINT "InvoiceRates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceDocument" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvoiceDocumentType" NOT NULL,
    "invoiceId" INTEGER NOT NULL,

    CONSTRAINT "InvoiceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "customerId" INTEGER,
    "managerId" TEXT NOT NULL,
    "parentId" INTEGER,
    "invoiceId" INTEGER,
    "accountId" INTEGER,
    "customerCandidateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PaymentWaiting" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentWaiting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Knowledge" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "preview" TEXT,
    "categoryID" INTEGER NOT NULL,
    "toMain" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 500,

    CONSTRAINT "Knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCategory" (
    "id" SERIAL NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 500,
    "name" VARCHAR(64) NOT NULL,

    CONSTRAINT "KnowledgeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerGroup_userId_key" ON "CustomerGroup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_contractId_key" ON "Settings"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_regionId_key" ON "Contacts"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_regionId_systemName_key" ON "SystemSettings"("regionId", "systemName");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerToSystemSettings_contractId_systemName_key" ON "CustomerToSystemSettings"("contractId", "systemName");

-- CreateIndex
CREATE UNIQUE INDEX "System_name_key" ON "System"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_taskId_key" ON "Account"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_id_key" ON "Contract"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_settingsId_key" ON "Contract"("settingsId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_taskId_key" ON "Invoice"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRates_invoiceId_key" ON "InvoiceRates"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWaiting_taskId_key" ON "PaymentWaiting"("taskId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerGroup" ADD CONSTRAINT "CustomerGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_systemName_fkey" FOREIGN KEY ("systemName") REFERENCES "System"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SysemSettingsLine" ADD CONSTRAINT "SysemSettingsLine_systemSettingsId_fkey" FOREIGN KEY ("systemSettingsId") REFERENCES "SystemSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SysemSettingsCustomerLine" ADD CONSTRAINT "SysemSettingsCustomerLine_systemSettingsId_fkey" FOREIGN KEY ("systemSettingsId") REFERENCES "CustomerToSystemSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerToSystemSettings" ADD CONSTRAINT "CustomerToSystemSettings_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerToSystemSettings" ADD CONSTRAINT "CustomerToSystemSettings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerToSystemSettings" ADD CONSTRAINT "CustomerToSystemSettings_systemName_fkey" FOREIGN KEY ("systemName") REFERENCES "System"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRates" ADD CONSTRAINT "InvoiceRates_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDocument" ADD CONSTRAINT "InvoiceDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWaiting" ADD CONSTRAINT "PaymentWaiting_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "KnowledgeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
