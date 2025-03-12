// src/schema/device.ts
import { z } from "zod";
import { isValidDeviceId } from "~/lib/mqtt-utils";

export const deviceStatusEnum = z.enum([
  "ONLINE",
  "OFFLINE",
  "MAINTENANCE",
  "ERROR",
]);
export type DeviceStatus = z.infer<typeof deviceStatusEnum>;

// Validate the deviceId to ensure it can be used in MQTT topics
const deviceIdValidator = z
  .string()
  .min(1, "Device ID is required")
  .refine(isValidDeviceId, {
    message:
      "Device ID can only contain letters, numbers, hyphens, and underscores",
  });

export const createDeviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  deviceId: deviceIdValidator,
  profileId: z.string().optional(),
  brokerId: z.string().optional(), // New field for broker association
});
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;

export const updateDeviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Device name is required").optional(),
  status: deviceStatusEnum.optional(),
  profileId: z.string().optional(),
  brokerId: z.string().optional(), // New field for broker association
});
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export const updateDeviceStatusSchema = z.object({
  id: z.string(),
  status: deviceStatusEnum,
});
export type UpdateDeviceStatusInput = z.infer<typeof updateDeviceStatusSchema>;
