/*
  Warnings:

  - You are about to drop the `paypal_subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "paypal_subscription" DROP CONSTRAINT "paypal_subscription_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "paypal_plan_id" TEXT,
ADD COLUMN     "paypal_subscription_id" TEXT;

-- DropTable
DROP TABLE "paypal_subscription";
