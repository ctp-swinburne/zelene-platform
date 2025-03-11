// app/(main_layout)/devices/first/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { MonitorSmartphone, ArrowRight, ChevronLeft } from "lucide-react";
import type { CreateDeviceInput } from "~/schema/device";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function FirstDevicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrokerInherited, setIsBrokerInherited] = useState(false);
  const [formData, setFormData] = useState<CreateDeviceInput>({
    name: "",
    deviceId: "",
    profileId: undefined,
    brokerId: undefined,
  });

  // Fetch default profile
  const { data: profiles } = api.deviceProfile.getAll.useQuery(undefined, {
    select: (data) => data.filter((profile) => profile.isDefault),
  });

  // Fetch brokers
  const { data: brokers } = api.broker.getAll.useQuery();

  // Effect to automatically select broker when profile changes
  useEffect(() => {
    const defaultProfile = profiles?.[0];
    if (defaultProfile) {
      setFormData((prev) => ({
        ...prev,
        profileId: defaultProfile.id,
      }));

      if (defaultProfile.broker) {
        setFormData((prev) => ({
          ...prev,
          brokerId: defaultProfile.broker!.id,
        }));
        setIsBrokerInherited(true);
      }
    }
  }, [profiles]);

  // Setup create device mutation
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

    const defaultProfile = profiles?.[0];
    if (!defaultProfile) {
      toast({
        title: "Error",
        description:
          "No default profile found. Please contact system administrator.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Use explicitly specified brokerId or the one from the profile
      const deviceData = {
        ...formData,
        profileId: formData.profileId,
        brokerId: formData.brokerId === "none" ? undefined : formData.brokerId,
      };

      await createDevice.mutateAsync(deviceData);
    } catch (error) {
      console.error("Error creating device:", error);
      setIsSubmitting(false);
    }
  };

  // Get the selected profile info
  const selectedProfileId = formData.profileId;
  const selectedProfile = selectedProfileId
    ? profiles?.find((p) => p.id === selectedProfileId)
    : null;
  const profileHasBroker = selectedProfile?.broker != null;

  return (
    <div className="container mx-auto max-w-3xl py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/devices")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Devices
      </Button>

      <Card className="border-2 border-dashed">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <MonitorSmartphone className="h-6 w-6" />
            <CardTitle>Connect Your First Device</CardTitle>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by adding basic information about your IoT device
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="Enter device name"
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
                    Broker is inherited from the default profile
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      Create Device
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-medium">Next Steps:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Configure your device with the provided credentials</li>
              <li>2. Connect your device using the following details:</li>
              <div className="mt-2 space-y-1 rounded-md bg-background p-3 font-mono text-xs">
                <div>Broker: mqtt.zelene.local</div>
                <div>Port: 1883</div>
                <div>Username: device_{formData.deviceId || "<device_id>"}</div>
              </div>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
