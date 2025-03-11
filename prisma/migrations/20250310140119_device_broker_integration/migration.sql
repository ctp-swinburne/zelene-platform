-- AlterTable
ALTER TABLE "DeviceProfile" ADD COLUMN     "brokerId" TEXT;

-- CreateIndex
CREATE INDEX "DeviceProfile_brokerId_idx" ON "DeviceProfile"("brokerId");

-- AddForeignKey
ALTER TABLE "DeviceProfile" ADD CONSTRAINT "DeviceProfile_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
