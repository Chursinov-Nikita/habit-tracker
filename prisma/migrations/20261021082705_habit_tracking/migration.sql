/*
  Warnings:

  - You are about to drop the column `preset` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Habit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,key]` on the table `Habit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Habit_userId_title_key";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "preset",
DROP COLUMN "title",
ADD COLUMN     "best" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "custom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goalDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "relapses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "selected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "tracked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trackedGoal" INTEGER NOT NULL DEFAULT 30;

-- CreateIndex
CREATE UNIQUE INDEX "Habit_userId_key_key" ON "Habit"("userId", "key");
