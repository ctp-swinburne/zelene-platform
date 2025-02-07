// ~/schema/device.ts
import { z } from "zod";

export const deviceStatusEnum = z.enum([
  "ONLINE",
  "OFFLINE",
  "MAINTENANCE",
  "ERROR",
]);
export type DeviceStatus = z.infer<typeof deviceStatusEnum>;

export const createDeviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  deviceId: z.string().min(1, "Device ID is required"),
  profileId: z.string().optional(),
});
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;

export const updateDeviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Device name is required").optional(),
  status: deviceStatusEnum.optional(),
  profileId: z.string().optional(),
});
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export const updateDeviceStatusSchema = z.object({
  id: z.string(),
  status: deviceStatusEnum,
});
export type UpdateDeviceStatusInput = z.infer<typeof updateDeviceStatusSchema>;
