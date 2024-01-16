-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "complaintEmail" TEXT,
ADD COLUMN     "complaintForm" BOOLEAN NOT NULL DEFAULT false;
