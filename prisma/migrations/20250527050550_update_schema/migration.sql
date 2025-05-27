/*
  Warnings:

  - A unique constraint covering the columns `[storeId,productId]` on the table `StoreProduct` will be added. If there are existing duplicate values, this will fail.
  - Made the column `purchasePrice` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salePrice` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "purchasePrice" SET NOT NULL,
ALTER COLUMN "salePrice" SET NOT NULL;

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "address" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StoreProduct_storeId_productId_key" ON "StoreProduct"("storeId", "productId");
