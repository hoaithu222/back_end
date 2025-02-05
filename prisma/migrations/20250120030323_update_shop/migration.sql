/*
  Warnings:

  - You are about to drop the column `min_order_amount` on the `shops` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "shops" DROP COLUMN "min_order_amount";

-- CreateIndex
CREATE UNIQUE INDEX "shops_user_id_key" ON "shops"("user_id");
