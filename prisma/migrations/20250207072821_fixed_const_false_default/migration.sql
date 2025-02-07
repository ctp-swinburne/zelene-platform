-- DropIndex
DROP INDEX "DeviceProfile_userId_isDefault_key";

-- CreateIndex
CREATE INDEX "DeviceProfile_userId_isDefault_idx" ON "DeviceProfile"("userId", "isDefault");
