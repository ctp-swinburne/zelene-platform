// src/schema/mqttTopic.ts
import { z } from "zod";

export const mqttDirectionEnum = z.enum(["PUBLISH", "SUBSCRIBE"]);
export type MqttDirection = z.infer<typeof mqttDirectionEnum>;

// Basic validation for MQTT topics
const topicValidator = z
  .string()
  .min(1, "Topic is required")
  .refine((topic) => !/[^a-zA-Z0-9/:._{}\-+#]/.test(topic), {
    message:
      "Topic can only contain alphanumeric characters, /, :, ., _, -, +, # and {deviceId}",
  })
  .refine((topic) => !topic.includes("//"), {
    message: "Topic cannot contain consecutive slashes",
  });

// Base schema with common fields
const baseMqttTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  description: z.string().optional(),
  topicPattern: topicValidator,
  direction: mqttDirectionEnum,
  qos: z.number().min(0).max(2),
  retain: z.boolean().default(false),
});

// Create new MQTT topic schema
export const createMqttTopicSchema = baseMqttTopicSchema.extend({
  profileId: z.string(),
});

export type CreateMqttTopicInput = z.infer<typeof createMqttTopicSchema>;

// Update MQTT topic schema
export const updateMqttTopicSchema = z
  .object({
    id: z.string(),
  })
  .merge(baseMqttTopicSchema.partial());

export type UpdateMqttTopicInput = z.infer<typeof updateMqttTopicSchema>;

// Schema for bulk creating topics (for profile creation)
export const bulkCreateMqttTopicsSchema = z.array(createMqttTopicSchema);
export type BulkCreateMqttTopicsInput = z.infer<
  typeof bulkCreateMqttTopicsSchema
>;

// Schema for deleting a topic
export const deleteMqttTopicSchema = z.object({
  id: z.string(),
});
export type DeleteMqttTopicInput = z.infer<typeof deleteMqttTopicSchema>;

// QoS options for dropdowns
export const QOS_OPTIONS = [
  { value: 0, label: "QoS 0 - At most once" },
  { value: 1, label: "QoS 1 - At least once" },
  { value: 2, label: "QoS 2 - Exactly once" },
];

// Default topic templates
export const DEFAULT_TOPIC_TEMPLATES = [
  {
    name: "System Status",
    description: "Device system information and status updates",
    topicPattern: "devices/{deviceId}/system",
    direction: "SUBSCRIBE" as const,
    qos: 0,
    retain: false,
  },
  {
    name: "Telemetry Data",
    description: "Sensor readings and measurements from the device",
    topicPattern: "devices/{deviceId}/telemetry",
    direction: "SUBSCRIBE" as const,
    qos: 0,
    retain: false,
  },
  {
    name: "Command",
    description: "Commands sent to the device",
    topicPattern: "devices/{deviceId}/commands",
    direction: "PUBLISH" as const,
    qos: 1,
    retain: false,
  },
  {
    name: "Settings",
    description: "Device configuration settings",
    topicPattern: "devices/{deviceId}/settings",
    direction: "PUBLISH" as const,
    qos: 1,
    retain: true,
  },
];
