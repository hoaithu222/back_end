/*
  Warnings:

  - You are about to drop the column `cartId` on the `cart_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cartId_fkey";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "cartId";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "discount_amount" DROP NOT NULL,
ALTER COLUMN "discount_amount" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
