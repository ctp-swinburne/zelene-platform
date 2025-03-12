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
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { updateDeviceSchema } from "~/schema/device";
import type { UpdateDeviceInput } from "~/schema/device";
import { useToast } from "~/hooks/use-toast";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MqttTopicDisplay } from "~/components/mqtt/mqttTopicDisplay";
import type { MqttTopic } from "~/components/mqtt/mqttTopicEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function DeviceEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isBrokerInherited, setIsBrokerInherited] = useState(false);
  const [previousProfileId, setPreviousProfileId] = useState<
    string | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState("basic");
  const [profileMqttTopics, setProfileMqttTopics] = useState<MqttTopic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Get the device ID from URL params
  const deviceId = params.id as string;

  // Fetch device data
  const {
    data: device,
    isLoading: isFetchingDevice,
    error,
  } = api.device.getById.useQuery(deviceId, {
    enabled: !!deviceId,
  });

  // Fetch device profiles for the dropdown
  const { data: profiles } = api.deviceProfile.getAll.useQuery();

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Handle error in your component directly using the error value
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load device: " + error.message,
      });
      router.push("/devices");
    }
  }, [error, router, toast]);

  // Set up the form
  const form = useForm<UpdateDeviceInput>({
    resolver: zodResolver(updateDeviceSchema),
    defaultValues: {
      id: deviceId,
      name: "",
      status: undefined,
      profileId: undefined,
      brokerId: undefined,
    },
  });

  // Get the current values from the form
  const watchProfileId = form.watch("profileId");

  // Function to fetch MQTT topics for a profile
  const fetchProfileMqttTopics = async (profileId: string) => {
    if (!profileId || profileId === "none") {
      setProfileMqttTopics([]);
      return;
    }

    setIsLoadingTopics(true);
    try {
      const selectedProfile = profiles?.find((p) => p.id === profileId);
      if (selectedProfile?.transport === "MQTT") {
        // Use type assertion to help TypeScript understand the response type
        const topics = api.mqttTopic.getAllByProfileId.useQuery(profileId);

        // Assert the type of topics directly
        setProfileMqttTopics(topics as unknown as MqttTopic[]);
      } else {
        setProfileMqttTopics([]);
      }
    } catch (error) {
      console.error("Error fetching MQTT topics:", error);
      setProfileMqttTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };
  // Update form when device data is loaded
  useEffect(() => {
    if (device) {
      form.reset({
        id: device.id,
        name: device.name,
        status: device.status,
        profileId: device.profileId ?? undefined,
        brokerId: device.brokerId ?? undefined,
      });

      // Store initial profile ID to detect changes
      setPreviousProfileId(device.profileId ?? undefined);

      // Check if broker is inherited from profile
      setIsBrokerInherited(
        !!device.profileId &&
          !!device.profile?.brokerId &&
          device.brokerId === device.profile?.brokerId,
      );

      // Fetch MQTT topics if the device has a profile with MQTT transport
      if (device.profileId && device.profile?.transport === "MQTT") {
        void fetchProfileMqttTopics(device.profileId);
      }
    }
  }, [device, form]);

  // Effect to handle profile changes and broker inheritance
  useEffect(() => {
    if (watchProfileId !== previousProfileId && profiles) {
      // Profile has changed
      if (watchProfileId && watchProfileId !== "none") {
        const selectedProfile = profiles.find((p) => p.id === watchProfileId);

        if (selectedProfile?.broker) {
          // Set broker ID from the new profile
          form.setValue("brokerId", selectedProfile.broker.id);
          setIsBrokerInherited(true);
        } else {
          setIsBrokerInherited(false);
        }

        // Fetch MQTT topics for the selected profile
        void fetchProfileMqttTopics(watchProfileId);
      } else {
        // Profile removed or set to none
        setIsBrokerInherited(false);
        setProfileMqttTopics([]);
      }

      setPreviousProfileId(watchProfileId);
    }
  }, [watchProfileId, previousProfileId, profiles, form]);

  // Update mutation
  const updateDeviceMutation = api.device.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      router.push("/devices");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update device: " + error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: UpdateDeviceInput) => {
    // Convert "none" values to undefined before submission
    const submissionData = {
      ...data,
      profileId: data.profileId === "none" ? undefined : data.profileId,
      brokerId: data.brokerId === "none" ? undefined : data.brokerId,
    };

    updateDeviceMutation.mutate(submissionData);
  };

  if (isFetchingDevice) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Device not found</h1>
        <Button onClick={() => router.push("/devices")}>Back to Devices</Button>
      </div>
    );
  }

  // Get profile related info for display
  const selectedProfile =
    watchProfileId && watchProfileId !== "none"
      ? profiles?.find((p) => p.id === watchProfileId)
      : null;
  const profileHasBroker = selectedProfile?.broker != null;

  // Determine if we should show the MQTT tab
  const showMqttTab =
    selectedProfile?.transport === "MQTT" ||
    (device.profile?.transport === "MQTT" && !watchProfileId);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/devices")}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Device</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/devices")}>
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
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              {showMqttTab && (
                <TabsTrigger value="mqtt">MQTT Topics</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Device Details</CardTitle>
                  <CardDescription>
                    Update the details for your device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter device name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select device status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ONLINE">Online</SelectItem>
                            <SelectItem value="OFFLINE">Offline</SelectItem>
                            <SelectItem value="MAINTENANCE">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="ERROR">Error</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Profile</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a device profile" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {profiles?.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.name}{" "}
                                {profile.isDefault && "(Default)"}
                                {profile.broker
                                  ? ` - Uses ${profile.broker.name}`
                                  : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {profileHasBroker && (
                          <FormDescription>
                            This profile uses broker:{" "}
                            {selectedProfile?.broker?.name}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brokerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MQTT Broker</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "none"}
                          disabled={isBrokerInherited}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a broker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {brokers?.map((broker) => (
                              <SelectItem key={broker.id} value={broker.id}>
                                {broker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isBrokerInherited && (
                          <FormDescription className="text-amber-500">
                            Broker is inherited from the selected profile
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/devices")}
                  >
                    Cancel
                  </Button>
                  {showMqttTab ? (
                    <Button type="button" onClick={() => setActiveTab("mqtt")}>
                      Next: MQTT Topics
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={updateDeviceMutation.isPending}
                    >
                      {updateDeviceMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="mqtt">
              <Card>
                <CardHeader>
                  <CardTitle>MQTT Topics Preview</CardTitle>
                  <CardDescription>
                    These are the MQTT topics that will be used by this device
                    based on the selected profile. The device ID placeholder
                    will be replaced with the actual device ID.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTopics ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : profileMqttTopics.length > 0 ? (
                    <MqttTopicDisplay
                      topics={profileMqttTopics}
                      deviceId={device.deviceId}
                      title="Profile MQTT Topics"
                      showDeviceIdInput={false}
                    />
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No MQTT topics configured for the selected profile. You
                        may want to add topics to the profile first.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back: Basic Information
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateDeviceMutation.isPending}
                  >
                    {updateDeviceMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
