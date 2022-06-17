/*
  Warnings:

  - You are about to drop the column `auth0_sub` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `queues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduled_jobs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[authz_sub]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_user_id_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_jobs" DROP CONSTRAINT "scheduled_jobs_user_id_fkey";

-- DropIndex
DROP INDEX "users_auth0_sub_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "auth0_sub",
ADD COLUMN     "authz_sub" TEXT;

-- DropTable
DROP TABLE "queues";

-- DropTable
DROP TABLE "scheduled_jobs";

-- CreateIndex
CREATE UNIQUE INDEX "users_authz_sub_key" ON "users"("authz_sub");
