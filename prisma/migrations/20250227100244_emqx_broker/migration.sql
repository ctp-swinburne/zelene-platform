-- CreateEnum
CREATE TYPE "BrokerNodeType" AS ENUM ('SINGLE', 'CLUSTER');

-- CreateEnum
CREATE TYPE "BrokerAuthType" AS ENUM ('BUILT_IN', 'MYSQL', 'POSTGRES', 'MONGODB', 'JWT');

-- CreateEnum
CREATE TYPE "BrokerStatus" AS ENUM ('RUNNING', 'STOPPED', 'ERROR');

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "brokerId" TEXT;

-- CreateTable
CREATE TABLE "Broker" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "nodeType" "BrokerNodeType" NOT NULL DEFAULT 'SINGLE',
    "userId" TEXT NOT NULL,
    "mqttEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
    "wssEnabled" BOOLEAN NOT NULL DEFAULT false,
    "authType" "BrokerAuthType" NOT NULL DEFAULT 'BUILT_IN',
    "authUsername" TEXT,
    "authPassword" TEXT,
    "dbHost" TEXT,
    "dbPort" INTEGER,
    "dbName" TEXT,
    "dbUsername" TEXT,
    "dbPassword" TEXT,
    "jwtSecret" TEXT,
    "jwtAlgorithm" TEXT,
    "maxConnections" INTEGER NOT NULL DEFAULT 1000000,
    "keepAlive" INTEGER NOT NULL DEFAULT 300,
    "enableAcl" BOOLEAN NOT NULL DEFAULT false,
    "enableMetrics" BOOLEAN NOT NULL DEFAULT false,
    "status" "BrokerStatus" NOT NULL DEFAULT 'STOPPED',

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Broker_userId_idx" ON "Broker"("userId");

-- CreateIndex
CREATE INDEX "Device_brokerId_idx" ON "Device"("brokerId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
