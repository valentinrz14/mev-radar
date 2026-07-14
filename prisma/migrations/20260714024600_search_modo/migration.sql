-- CreateEnum
CREATE TYPE "SearchModo" AS ENUM ('caratula', 'expediente', 'receptoria');

-- AlterTable
ALTER TABLE "Search" ADD COLUMN     "modo" "SearchModo" NOT NULL DEFAULT 'caratula';
