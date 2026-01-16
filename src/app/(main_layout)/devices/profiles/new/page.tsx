"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { ArrowLeft, Settings2, Radio } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { MqttTopicEditor } from "~/components/mqtt/mqttTopicEditor";
import { isValidDeviceId } from "~/lib/mqtt-utils";
import { DEFAULT_TOPIC_TEMPLATES } from "~/schema/mqttTopic";
import type { CreateProfileInput } from "~/schema/deviceProfile";
import type { MqttTopic } from "~/components/mqtt/mqttTopicEditor";

export default function DeviceProfileCreation() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [previewDeviceId, setPreviewDeviceId] = useState("sample-device-1");
  const [mqttTopics, setMqttTopics] = useState<MqttTopic[]>(
    DEFAULT_TOPIC_TEMPLATES.map((template) => ({
      ...template,
    })),
  );

  // Basic profile form data
  const [formData, setFormData] = useState<CreateProfileInput>({
    name: "",
    description: "",
    transport: "MQTT" as const,
    isDefault: false,
    brokerId: undefined,
  });

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Setup mutation for creating profile
  const createProfile = api.deviceProfile.create.useMutation({
    onSuccess: async (newProfile) => {
      // After creating the profile, create the MQTT topics
      try {
        if (formData.transport === "MQTT" && mqttTopics.length > 0) {
          // Fix for the createMqttTopics.mutateAsync call
          await createMqttTopics.mutateAsync(
            mqttTopics.map((topic) => ({
              name: topic.name,
              profileId: newProfile.id,
              topicPattern: topic.topicPattern,
              direction: topic.direction,
              qos: topic.qos,
              retain: topic.retain,
              description: topic.description ?? undefined,
            })),
          );
        }

        toast({
          title: "Success",
          description: "Device profile created successfully",
        });
        await utils.deviceProfile.getAll.invalidate();
        router.push("/devices/profiles");
      } catch (error) {
        toast({
          title: "Warning",
          description: "Profile created but failed to save all MQTT topics",
          variant: "destructive",
        });
        router.push("/devices/profiles");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Setup mutation for creating MQTT topics
  const createMqttTopics = api.mqttTopic.bulkCreate.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure we're sending the correct data structure
      const profileData = {
        ...formData,
        brokerId: formData.brokerId === "none" ? undefined : formData.brokerId,
      };

      await createProfile.mutateAsync(profileData);
      // MQTT topics are created in the onSuccess callback
    } catch (error) {
      console.error("Error creating device profile:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl">
      <div className="mb-2 flex items-center">
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => router.push("/devices/profiles")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Device Profiles
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Device Profile</h1>
        <p className="text-sm text-muted-foreground">
          Create a template for devices with similar characteristics
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger
              value="mqtt"
              disabled={formData.transport !== "MQTT"}
              title={
                formData.transport !== "MQTT"
                  ? "Only available for MQTT transport"
                  : ""
              }
            >
              MQTT Topics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="rounded-lg border">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    <h2 className="text-base font-semibold">
                      Profile Settings
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Temperature Sensor Profile"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Choose a unique name for this device profile
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="e.g., Profile for temperature monitoring sensors"
                      value={formData.description ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="h-20"
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide details about the profile&apos;s purpose and usage
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="transport">Transport Type</Label>
                    <Select
                      value={formData.transport}
                      onValueChange={(value: "MQTT" | "TCP") =>
                        setFormData((prev) => ({ ...prev, transport: value }))
                      }
                    >
                      <SelectTrigger id="transport">
                        <SelectValue placeholder="Select transport type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MQTT">MQTT</SelectItem>
                        <SelectItem value="TCP">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the communication protocol for devices using this
                      profile
                    </p>
                  </div>

                  {/* Broker Selection */}
                  <div className="space-y-1.5">
                    <Label htmlFor="brokerId">MQTT Broker</Label>
                    <Select
                      value={formData.brokerId ?? "none"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          brokerId: value === "none" ? undefined : value,
                        }))
                      }
                      disabled={formData.transport !== "MQTT"}
                    >
                      <SelectTrigger id="brokerId">
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (No Broker)</SelectItem>
                        {brokers?.map((broker) => (
                          <SelectItem key={broker.id} value={broker.id}>
                            {broker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Associate a broker with this profile. Devices using this
                      profile will inherit this broker.
                    </p>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="isDefault">Set as Default</Label>
                      <p className="text-sm text-muted-foreground">
                        Make this the default profile for new devices
                      </p>
                    </div>
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({ ...prev, isDefault: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/devices/profiles")}
                  >
                    Cancel
                  </Button>
                  {formData.transport === "MQTT" ? (
                    <Button type="button" onClick={() => setActiveTab("mqtt")}>
                      Next: Configure MQTT Topics
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Profile"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mqtt">
            <Card className="rounded-lg border">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    <h2 className="text-base font-semibold">
                      MQTT Topic Configuration
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Configure MQTT topics for devices using this profile. Use{" "}
                    {"{deviceId}"} as a placeholder for the actual device ID.
                  </p>
                </div>

                <MqttTopicEditor
                  topics={mqttTopics}
                  onTopicsChange={setMqttTopics}
                  previewDeviceId={previewDeviceId}
                  onPreviewDeviceIdChange={setPreviewDeviceId}
                />

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back: Basic Information
                  </Button>
                  <div className="space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/devices/profiles")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Profile"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
