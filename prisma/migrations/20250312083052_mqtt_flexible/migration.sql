/*
  Warnings:

  - You are about to drop the column `mqttCommandQos` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttCommandRetain` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttCommandTopic` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSettingsQos` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSettingsRetain` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSettingsTopic` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSystemQos` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSystemRetain` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttSystemTopic` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttTelemetryQos` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttTelemetryRetain` on the `DeviceProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mqttTelemetryTopic` on the `DeviceProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MqttDirection" AS ENUM ('PUBLISH', 'SUBSCRIBE');

-- AlterTable
ALTER TABLE "DeviceProfile" DROP COLUMN "mqttCommandQos",
DROP COLUMN "mqttCommandRetain",
DROP COLUMN "mqttCommandTopic",
DROP COLUMN "mqttSettingsQos",
DROP COLUMN "mqttSettingsRetain",
DROP COLUMN "mqttSettingsTopic",
DROP COLUMN "mqttSystemQos",
DROP COLUMN "mqttSystemRetain",
DROP COLUMN "mqttSystemTopic",
DROP COLUMN "mqttTelemetryQos",
DROP COLUMN "mqttTelemetryRetain",
DROP COLUMN "mqttTelemetryTopic";

-- CreateTable
CREATE TABLE "MqttTopic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "topicPattern" TEXT NOT NULL,
    "direction" "MqttDirection" NOT NULL,
    "qos" INTEGER NOT NULL DEFAULT 0,
    "retain" BOOLEAN NOT NULL DEFAULT false,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "MqttTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MqttTopic_profileId_idx" ON "MqttTopic"("profileId");

-- AddForeignKey
ALTER TABLE "MqttTopic" ADD CONSTRAINT "MqttTopic_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DeviceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
