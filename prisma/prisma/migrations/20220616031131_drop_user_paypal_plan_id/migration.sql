/*
  Warnings:

  - You are about to drop the column `paypal_plan_id` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "paypal_plan_id";
