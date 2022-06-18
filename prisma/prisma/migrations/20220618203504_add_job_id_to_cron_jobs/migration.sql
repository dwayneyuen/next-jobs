/*
  Warnings:

  - A unique constraint covering the columns `[path,user_id]` on the table `cron_job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,user_id]` on the table `message_queue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path,user_id]` on the table `message_queue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `job_id` to the `cron_job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cron_job" ADD COLUMN     "job_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cron_job_path_user_id_key" ON "cron_job"("path", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_queue_name_user_id_key" ON "message_queue"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_queue_path_user_id_key" ON "message_queue"("path", "user_id");
