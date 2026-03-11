-- AlterTable
ALTER TABLE "UserScore" ADD COLUMN     "dailyScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastResetAt" TIMESTAMP(3);
