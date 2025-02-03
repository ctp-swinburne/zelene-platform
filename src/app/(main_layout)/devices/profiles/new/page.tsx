"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ArrowLeft, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

type TransportType = "mqtt" | "tcp";

export default function DeviceProfileCreation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    transport: "" as TransportType,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTransportChange = (value: TransportType) => {
    setFormData((prev) => ({
      ...prev,
      transport: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API call would go here
      router.push("/devices/profiles");
    } catch (error) {
      console.error("Error creating device profile:", error);
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
                  onChange={handleChange}
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
                  value={formData.description}
                  onChange={handleChange}
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
                  onValueChange={handleTransportChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mqtt">MQTT</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 text-sm text-muted-foreground">
                  <span>
                    Select the communication protocol for devices using this
                    profile
                  </span>
                </div>
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
              <Button type="submit">Create Profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
