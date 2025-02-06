-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refreshTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "blacklistedToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklistedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blacklistedToken_token_key" ON "blacklistedToken"("token");
