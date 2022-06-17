/*
  Warnings:

  - You are about to drop the column `jobLimit` on the `plan` table. All the data in the column will be lost.
  - Added the required column `job_limit` to the `plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plan" DROP COLUMN "jobLimit",
ADD COLUMN     "job_limit" INTEGER NOT NULL;
