-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiry" TEXT,
ADD COLUMN     "verifiedAt" TEXT;
