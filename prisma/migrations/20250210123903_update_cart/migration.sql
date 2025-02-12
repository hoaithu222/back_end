/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,product_id,variant_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_fkey";

-- DropIndex
DROP INDEX "cart_items_cart_id_variant_id_key";

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "product_id" INTEGER,
ALTER COLUMN "variant_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key" ON "cart_items"("cart_id", "product_id", "variant_id");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
