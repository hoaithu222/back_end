/*
  Warnings:

  - Added the required column `shop_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "shop_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
