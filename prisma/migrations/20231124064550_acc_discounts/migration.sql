-- CreateTable
CREATE TABLE "AccumulativeDiscount" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "system" TEXT NOT NULL,

    CONSTRAINT "AccumulativeDiscount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccumulativeDiscount" ADD CONSTRAINT "AccumulativeDiscount_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
