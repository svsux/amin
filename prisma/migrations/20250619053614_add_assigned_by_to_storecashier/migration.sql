/*
  Warnings:

  - A unique constraint covering the columns `[storeId,cashierId]` on the table `StoreCashier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignedBy` to the `StoreCashier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StoreCashier" DROP CONSTRAINT "StoreCashier_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "StoreCashier" DROP CONSTRAINT "StoreCashier_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreProduct" DROP CONSTRAINT "StoreProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "StoreProduct" DROP CONSTRAINT "StoreProduct_storeId_fkey";

-- AlterTable
ALTER TABLE "StoreCashier" ADD COLUMN     "assignedBy" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StoreCashier_storeId_cashierId_key" ON "StoreCashier"("storeId", "cashierId");

-- AddForeignKey
ALTER TABLE "StoreCashier" ADD CONSTRAINT "StoreCashier_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCashier" ADD CONSTRAINT "StoreCashier_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
