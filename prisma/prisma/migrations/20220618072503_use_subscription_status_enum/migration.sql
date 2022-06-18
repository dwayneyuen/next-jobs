/*
  Warnings:

  - The `paypal_subscription_status` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "paypal_subscription_status",
ADD COLUMN     "paypal_subscription_status" "PaypalSubscriptionStatus";
