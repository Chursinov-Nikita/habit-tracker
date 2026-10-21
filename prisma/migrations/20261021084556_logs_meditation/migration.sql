/*
  Warnings:

  - You are about to drop the column `date` on the `HabitLog` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `HabitLog` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `HabitLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[habitId,day]` on the table `HabitLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `HabitLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HabitLog" DROP COLUMN "date",
DROP COLUMN "note",
DROP COLUMN "success",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "day" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MeditationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeditationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeditationSession_userId_day_idx" ON "MeditationSession"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_day_key" ON "HabitLog"("habitId", "day");

-- AddForeignKey
ALTER TABLE "MeditationSession" ADD CONSTRAINT "MeditationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
