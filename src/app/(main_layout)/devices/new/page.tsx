"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronLeft, Plus } from "lucide-react";
import type { CreateDeviceInput } from "~/schema/device";

export default function NewDevicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();
  const [formData, setFormData] = useState<CreateDeviceInput>({
    name: "",
    deviceId: "",
    profileId: undefined,
    brokerId: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrokerInherited, setIsBrokerInherited] = useState(false);

  // Fetch device profiles for the select dropdown
  const { data: profiles } = api.deviceProfile.getAll.useQuery();

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Effect to automatically select broker when profile changes
  useEffect(() => {
    if (formData.profileId && profiles) {
      const selectedProfile = profiles.find((p) => p.id === formData.profileId);

      if (selectedProfile?.broker) {
        setFormData((prev) => ({
          ...prev,
          brokerId: selectedProfile.broker!.id,
        }));
        setIsBrokerInherited(true);
      } else {
        setIsBrokerInherited(false);
      }
    } else {
      setIsBrokerInherited(false);
    }
  }, [formData.profileId, profiles]);

  // Setup mutation
  const createDevice = api.device.create.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Device created successfully",
      });
      // Invalidate the devices query before navigating
      await utils.device.getAll.invalidate();
      router.push("/devices");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Handle "none" selections for broker and profile
      const deviceData = {
        ...formData,
        profileId:
          formData.profileId === "none" ? undefined : formData.profileId,
        brokerId: formData.brokerId === "none" ? undefined : formData.brokerId,
      };

      await createDevice.mutateAsync(deviceData);
    } catch (error) {
      console.error("Error creating device:", error);
      setIsSubmitting(false);
    }
  };

  // Check if the selected profile has a broker
  const selectedProfile =
    formData.profileId && formData.profileId !== "none"
      ? profiles?.find((p) => p.id === formData.profileId)
      : null;
  const profileHasBroker = selectedProfile?.broker != null;

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" onClick={() => router.push("/devices")}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Add New Device</h1>
          <p className="text-sm text-muted-foreground">
            Register a new IoT device to your network
          </p>
        </div>
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Device Information</CardTitle>
              <CardDescription>
                Enter the details for your new IoT device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., Temperature Sensor A1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="Enter unique device identifier"
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deviceId: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileId">Device Profile</Label>
                <Select
                  value={formData.profileId ?? "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileId: value === "none" ? undefined : value,
                      // Reset broker if profile is changed to none
                      brokerId: value === "none" ? undefined : prev.brokerId,
                    }))
                  }
                >
                  <SelectTrigger id="profileId">
                    <SelectValue placeholder="Select a device profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (No Profile)</SelectItem>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                        {profile.isDefault ? " (Default)" : ""}
                        {profile.broker ? ` - Uses ${profile.broker.name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {profileHasBroker && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    This profile uses broker: {selectedProfile?.broker?.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brokerId">MQTT Broker</Label>
                <Select
                  value={formData.brokerId ?? "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      brokerId: value === "none" ? undefined : value,
                    }))
                  }
                  disabled={isBrokerInherited}
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
                {isBrokerInherited && (
                  <p className="mt-1 text-xs text-amber-500">
                    Broker is inherited from the selected profile
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push("/devices")}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Device
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Connection Details</CardTitle>
            <CardDescription>
              Use these details to configure your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 items-center gap-2">
                <div className="text-muted-foreground">Broker Address:</div>
                <div className="font-mono">mqtt.zelene.local</div>
                <div className="text-muted-foreground">Port:</div>
                <div className="font-mono">1883</div>
                <div className="text-muted-foreground">Username:</div>
                <div className="font-mono">
                  device_{formData.deviceId || "<device_id>"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
