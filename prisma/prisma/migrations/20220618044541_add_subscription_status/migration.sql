-- CreateEnum
CREATE TYPE "PaypalSubscriptionStatus" AS ENUM ('APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "jobs_remaining" INTEGER,
ADD COLUMN     "paypal_subscription_status" TEXT;

-- CreateIndex
CREATE INDEX "user_access_token_idx" ON "user"("access_token");

-- CreateIndex
CREATE INDEX "user_authz_sub_idx" ON "user"("authz_sub");
