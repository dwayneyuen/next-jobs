-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan_id" UUID;

-- CreateTable
CREATE TABLE "plan" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paypal_plan_id" TEXT NOT NULL,
    "jobLimit" INTEGER NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_paypal_plan_id_key" ON "plan"("paypal_plan_id");

-- CreateIndex
CREATE INDEX "plan_paypal_plan_id_idx" ON "plan"("paypal_plan_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
