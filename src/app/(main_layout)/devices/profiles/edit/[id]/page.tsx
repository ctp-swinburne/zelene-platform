"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Loader2, Radio } from "lucide-react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { updateProfileSchema } from "~/schema/deviceProfile";
import type { UpdateProfileInput } from "~/schema/deviceProfile";
import { useToast } from "~/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { MqttTopicEditor } from "~/components/mqtt/mqttTopicEditor";
import type { MqttTopic } from "~/components/mqtt/mqttTopicEditor";

export default function DeviceProfileEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [previewDeviceId, setPreviewDeviceId] = useState("sample-device-1");
  const [mqttTopics, setMqttTopics] = useState<MqttTopic[]>([]);
  const [initialMqttTopics, setInitialMqttTopics] = useState<MqttTopic[]>([]);

  // Get the profile ID from URL params
  const profileId = params.id as string;

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Fetch profile data
  const {
    data: profile,
    isLoading: isFetchingProfile,
    error: profileError,
  } = api.deviceProfile.getById.useQuery(profileId, {
    enabled: !!profileId,
  });

  // Fetch MQTT topics
  const {
    data: fetchedTopics,
    isLoading: isFetchingTopics,
    refetch: refetchTopics,
  } = api.mqttTopic.getAllByProfileId.useQuery(profileId, {
    enabled: !!profileId,
  });

  // Update MQTT topics when they're fetched
  useEffect(() => {
    if (fetchedTopics) {
      setMqttTopics(fetchedTopics);
      setInitialMqttTopics(fetchedTopics);
    }
  }, [fetchedTopics]);

  // Handle error in your component directly using the profileError value
  useEffect(() => {
    if (profileError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile: " + profileError.message,
      });
      router.push("/devices/profiles");
    }
  }, [profileError, router, toast]);

  // Set up the form
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id: profileId,
      brokerId: undefined,
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        id: profile.id,
        name: profile.name,
        description: profile.description ?? undefined,
        transport: profile.transport,
        isDefault: profile.isDefault,
        brokerId: profile.brokerId ?? undefined,
      });
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfileMutation = api.deviceProfile.update.useMutation();

  // Create MQTT topics mutation
  const createMqttTopicMutation = api.mqttTopic.create.useMutation();

  // Update MQTT topic mutation
  const updateMqttTopicMutation = api.mqttTopic.update.useMutation();

  // Delete MQTT topic mutation
  const deleteMqttTopicMutation = api.mqttTopic.delete.useMutation();

  // Handle form submission
  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      // If brokerId is "none", set it to undefined
      if (data.brokerId === "none") {
        data.brokerId = undefined;
      }

      // Update the profile
      await updateProfileMutation.mutateAsync(data);

      // Only process MQTT topics if the transport type is MQTT
      if (data.transport === "MQTT") {
        // Process MQTT topics - identify created, updated, and deleted topics
        const topicsToCreate = mqttTopics.filter((topic) => !topic.id);
        const topicsToUpdate = mqttTopics.filter(
          (topic) =>
            topic.id &&
            initialMqttTopics.some(
              (initialTopic) =>
                initialTopic.id === topic.id &&
                (initialTopic.name !== topic.name ||
                  initialTopic.description !== topic.description ||
                  initialTopic.topicPattern !== topic.topicPattern ||
                  initialTopic.direction !== topic.direction ||
                  initialTopic.qos !== topic.qos ||
                  initialTopic.retain !== topic.retain),
            ),
        );
        const topicsToDelete = initialMqttTopics.filter(
          (initialTopic) =>
            !mqttTopics.some((topic) => topic.id === initialTopic.id),
        );

        // Create new topics
        for (const topic of topicsToCreate) {
          await createMqttTopicMutation.mutateAsync({
            ...topic,
            // Fix: Convert description from potential null to undefined if null
            description: topic.description ?? undefined,
            profileId: profileId,
          });
        }

        // Update existing topics
        for (const topic of topicsToUpdate) {
          if (topic.id) {
            await updateMqttTopicMutation.mutateAsync({
              id: topic.id,
              name: topic.name,
              description: topic.description ?? undefined,
              topicPattern: topic.topicPattern,
              direction: topic.direction,
              qos: topic.qos,
              retain: topic.retain,
            });
          }
        }

        // Delete removed topics
        for (const topic of topicsToDelete) {
          if (topic.id) {
            await deleteMqttTopicMutation.mutateAsync({ id: topic.id });
          }
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.push("/devices/profiles");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile: " + (error as Error).message,
      });
    }
  };

  const isSubmitting =
    updateProfileMutation.isPending ||
    createMqttTopicMutation.isPending ||
    updateMqttTopicMutation.isPending ||
    deleteMqttTopicMutation.isPending;

  if (isFetchingProfile || isFetchingTopics) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <Button onClick={() => router.push("/devices/profiles")}>
          Back to Profiles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Device Profile</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/devices/profiles")}
        >
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger
                value="mqtt"
                disabled={profile.transport !== "MQTT"}
                title={
                  profile.transport !== "MQTT"
                    ? "Only available for MQTT transport"
                    : ""
                }
              >
                MQTT Topics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>
                    Update the basic details for your device profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter profile name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Enter profile description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transport Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transport type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MQTT">MQTT</SelectItem>
                            <SelectItem value="TCP">TCP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Add Broker Selection */}
                  <FormField
                    control={form.control}
                    name="brokerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MQTT Broker</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "none"}
                          disabled={profile.transport !== "MQTT"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a broker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              None (No Broker)
                            </SelectItem>
                            {brokers?.map((broker) => (
                              <SelectItem key={broker.id} value={broker.id}>
                                {broker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Associate a broker with this profile. Devices using
                          this profile will inherit this broker.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Default Profile</FormLabel>
                          <FormDescription>
                            Set this as the default profile for new devices
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/devices/profiles")}
                    >
                      Cancel
                    </Button>
                    {profile.transport === "MQTT" ? (
                      <Button
                        type="button"
                        onClick={() => setActiveTab("mqtt")}
                      >
                        Next: MQTT Topics
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mqtt">
              <Card>
                <CardHeader>
                  <CardTitle>MQTT Topic Configuration</CardTitle>
                  <CardDescription>
                    Configure the MQTT topics that devices will use with this
                    profile. Use {"{deviceId}"} as a placeholder for the actual
                    device ID.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    <div className="space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/devices/profiles")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
