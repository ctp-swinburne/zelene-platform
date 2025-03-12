-- AlterTable
ALTER TABLE "DeviceProfile" ADD COLUMN     "mqttCommandQos" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "mqttCommandRetain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mqttCommandTopic" TEXT,
ADD COLUMN     "mqttSettingsQos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mqttSettingsRetain" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mqttSettingsTopic" TEXT,
ADD COLUMN     "mqttSystemQos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mqttSystemRetain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mqttSystemTopic" TEXT,
ADD COLUMN     "mqttTelemetryQos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mqttTelemetryRetain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mqttTelemetryTopic" TEXT;
