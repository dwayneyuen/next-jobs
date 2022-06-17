/*
  Warnings:

  - A unique constraint covering the columns `[auth0_sub]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[access_token]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_token` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "access_token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_auth0_sub_key" ON "user"("auth0_sub");

-- CreateIndex
CREATE UNIQUE INDEX "user_access_token_key" ON "user"("access_token");
