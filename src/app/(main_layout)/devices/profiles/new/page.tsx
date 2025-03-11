"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { ArrowLeft, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import type { CreateProfileInput } from "~/schema/deviceProfile";

export default function DeviceProfileCreation() {
  const router = useRouter();
  const { toast } = useToast();
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Explicitly set all fields including isDefault and brokerId
  const [formData, setFormData] = useState<CreateProfileInput>({
    name: "",
    description: "",
    transport: "MQTT" as const,
    isDefault: false,
    brokerId: undefined, // Initialize brokerId
  });

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Setup mutation
  const createProfile = api.deviceProfile.create.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Device profile created successfully",
      });
      await utils.deviceProfile.getAll.invalidate();
      router.push("/devices/profiles");
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
      // Ensure we're sending the correct data structure
      const profileData: CreateProfileInput = {
        name: formData.name,
        description: formData.description ?? "",
        transport: formData.transport,
        isDefault: Boolean(formData.isDefault), // Ensure boolean type
        brokerId: formData.brokerId === "none" ? undefined : formData.brokerId, // Handle "none" selection
      };

      await createProfile.mutateAsync(profileData);
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

      <Card className="rounded-lg border">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <h2 className="text-base font-semibold">Profile Settings</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  placeholder="e.g., Temperature Sensor Profile"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Choose a unique name for this device profile
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea
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
                <label className="text-sm font-medium">Transport Type</label>
                <Select
                  value={formData.transport}
                  onValueChange={(value: "MQTT" | "TCP") =>
                    setFormData((prev) => ({ ...prev, transport: value }))
                  }
                >
                  <SelectTrigger>
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

              {/* New Broker Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">MQTT Broker</label>
                <Select
                  value={formData.brokerId ?? "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      brokerId: value === "none" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
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
                  <label className="text-sm font-medium">Set as Default</label>
                  <p className="text-sm text-muted-foreground">
                    Make this the default profile for new devices
                  </p>
                </div>
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, isDefault: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/devices/profiles")}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
