/*
  Warnings:

  - The primary key for the `cart_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[cart_id,variant_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");
