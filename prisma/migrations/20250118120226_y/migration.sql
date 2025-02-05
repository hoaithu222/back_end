/*
  Warnings:

  - You are about to drop the column `display_name` on the `attribute_types` table. All the data in the column will be lost.
  - You are about to drop the column `input_type` on the `attribute_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attribute_types" DROP COLUMN "display_name",
DROP COLUMN "input_type";
