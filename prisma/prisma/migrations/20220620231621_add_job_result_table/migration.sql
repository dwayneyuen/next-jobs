-- CreateEnum
CREATE TYPE "JobResultJobType" AS ENUM ('CRON_JOB', 'MESSAGE_QUEUE');

-- CreateEnum
CREATE TYPE "JobResultStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "job_result" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "httpStatus" INTEGER,
    "job_result_status" "JobResultStatus" NOT NULL,
    "job_type" "JobResultJobType" NOT NULL,
    "path" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "job_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_result_user_id_idx" ON "job_result"("user_id");

-- AddForeignKey
ALTER TABLE "job_result" ADD CONSTRAINT "job_result_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
