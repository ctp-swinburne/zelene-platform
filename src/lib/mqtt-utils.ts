// src/lib/mqtt-utils.ts

/**
 * Resolves an MQTT topic pattern by replacing {deviceId} with the actual device ID
 */
export function resolveTopic(
  topicPattern: string | null | undefined,
  deviceId: string,
): string {
  if (!topicPattern) return "";
  return topicPattern.replace(/\{deviceId\}/g, deviceId);
}

/**
 * Validates a device ID for use in MQTT topics
 * Only allows alphanumeric characters, hyphens, and underscores
 */
export function isValidDeviceId(deviceId: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(deviceId);
}

/**
 * Validates if a string is a valid MQTT topic pattern
 * We allow the {deviceId} placeholder and standard MQTT topic characters
 */
export function isValidTopicPattern(topic: string): boolean {
  if (!topic) return false; // Empty is not valid

  // Check if topic contains invalid characters (allows {deviceId} placeholder)
  const invalidCharsRegex = /[^a-zA-Z0-9/:._{}\-+#]/;
  if (invalidCharsRegex.test(topic)) return false;

  // Check for consecutive slashes
  if (topic.includes("//")) return false;

  return true;
}

/**
 * Get QoS options for dropdown
 */
export const QOS_OPTIONS = [
  { value: 0, label: "QoS 0 - At most once" },
  { value: 1, label: "QoS 1 - At least once" },
  { value: 2, label: "QoS 2 - Exactly once" },
];

/**
 * Topic interface with proper typing
 */
export interface MqttTopic {
  id?: string;
  topicPattern: string;
  [key: string]: unknown;
}

/**
 * Generate topic patterns with a device ID for preview or usage
 */
export function generateResolvedTopics(
  topics: MqttTopic[],
  deviceId: string,
): (MqttTopic & { resolvedTopic: string })[] {
  return topics.map((topic) => ({
    ...topic,
    resolvedTopic: resolveTopic(topic.topicPattern, deviceId),
  }));
}
/**
 * Direction labels for display
 */
export const DIRECTION_LABELS = {
  PUBLISH: "Publish (Platform → Device)",
  SUBSCRIBE: "Subscribe (Device → Platform)",
};

/**
 * Direction descriptions for tooltips
 */
export const DIRECTION_DESCRIPTIONS = {
  PUBLISH: "The platform publishes to this topic and the device subscribes",
  SUBSCRIBE: "The device publishes to this topic and the platform subscribes",
};

/**
 * Direction color classes
 */
export const DIRECTION_COLORS = {
  PUBLISH: "text-blue-500",
  SUBSCRIBE: "text-green-500",
};

/**
 * Check if a topic pattern is valid and provide helpful error messages
 */
export function validateTopicPattern(pattern: string): {
  valid: boolean;
  message?: string;
} {
  if (!pattern) {
    return { valid: false, message: "Topic pattern is required" };
  }

  if (/[^a-zA-Z0-9/:._{}\-+#]/.test(pattern)) {
    return {
      valid: false,
      message:
        "Topic can only contain alphanumeric characters, /, :, ., _, -, +, # and {deviceId}",
    };
  }

  if (pattern.includes("//")) {
    return {
      valid: false,
      message: "Topic cannot contain consecutive slashes",
    };
  }

  return { valid: true };
}
