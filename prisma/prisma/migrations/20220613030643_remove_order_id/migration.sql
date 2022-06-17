/*
  Warnings:

  - You are about to drop the column `order_id` on the `paypal_subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "paypal_subscription" DROP COLUMN "order_id";
