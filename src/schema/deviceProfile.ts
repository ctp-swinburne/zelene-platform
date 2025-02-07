// ~/schema/deviceProfile.ts
import { z } from "zod";

export const transportTypeEnum = z.enum(["MQTT", "TCP"]);
export type TransportType = z.infer<typeof transportTypeEnum>;

export const createProfileSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  description: z.string().optional(),
  transport: transportTypeEnum,
  isDefault: z.boolean().optional(),
});
export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Profile name is required").optional(),
  description: z.string().optional(),
  transport: transportTypeEnum.optional(),
  isDefault: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
