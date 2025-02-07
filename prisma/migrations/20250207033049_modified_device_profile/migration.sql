/*
  Warnings:

  - You are about to drop the column `defaultProfileId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,isDefault]` on the table `DeviceProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_profileId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_defaultProfileId_fkey";

-- DropIndex
DROP INDEX "User_defaultProfileId_idx";

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "profileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DeviceProfile" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "defaultProfileId";

-- CreateIndex
CREATE UNIQUE INDEX "DeviceProfile_userId_isDefault_key" ON "DeviceProfile"("userId", "isDefault");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DeviceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
