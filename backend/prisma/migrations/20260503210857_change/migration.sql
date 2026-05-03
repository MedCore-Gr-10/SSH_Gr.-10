/*
  Warnings:

  - You are about to drop the column `last_surname` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "last_surname",
ADD COLUMN     "last_name" VARCHAR(50);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
