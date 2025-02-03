// app/(main_layout)/devices/first/page.tsx
"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MonitorSmartphone, ArrowRight, ChevronLeft } from "lucide-react";

export default function FirstDevicePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your device creation logic here
    router.push("/devices");
  };

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

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Create Device
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-medium">Next Steps:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Configure your device with the provided credentials</li>
              <li>2. Start monitoring your device data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
