// app/(dashboard)/devices/new/page.tsx
"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

export default function NewDevicePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [deviceType, setDeviceType] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add device creation logic here
    router.push("/devices");
  };

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
                  value={deviceName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDeviceName(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="Enter unique device identifier"
                  value={deviceId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDeviceId(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger id="deviceType">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="esp32">ESP32</SelectItem>
                    <SelectItem value="esp8266">ESP8266</SelectItem>
                    <SelectItem value="raspberry-pi">Raspberry Pi</SelectItem>
                    <SelectItem value="arduino">Arduino</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/devices")}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Device
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
                  device_{deviceId || "<device_id>"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
