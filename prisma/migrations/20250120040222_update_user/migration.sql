/*
  Warnings:

  - The `verificationTokenExpiry` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `verifiedAt` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "verificationTokenExpiry",
ADD COLUMN     "verificationTokenExpiry" TIMESTAMP(3),
DROP COLUMN "verifiedAt",
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
