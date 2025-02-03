"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  MonitorSmartphone,
  Plus,
  Settings2,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { RouterOutputs } from "~/trpc/react";

type Device = {
  id: string;
  name: string;
  status: "online" | "offline";
  type: string;
  lastSeen: string;
  dataPoints: number;
};

type ViewMode = "grid" | "list";

export default function DevicesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Temporary state to demonstrate empty/filled states
  const [devices] = useState<Device[]>([
    {
      id: "esp32-01",
      name: "Temperature Sensor A1",
      status: "online",
      type: "ESP32",
      lastSeen: "2024-02-03T15:30:00",
      dataPoints: 1234,
    },
    // ... other devices
  ]);

  const DeviceActions = ({ device }: { device: Device }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Settings2 className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Delete Device
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const StatusIndicator = ({ status }: { status: Device["status"] }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "online" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm capitalize text-muted-foreground">{status}</span>
    </div>
  );

  const GridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <Card key={device.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MonitorSmartphone className="h-5 w-5" />
                <CardTitle className="text-base font-medium">
                  {device.name}
                </CardTitle>
              </div>
              <DeviceActions device={device} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <StatusIndicator status={device.status} />
              <span className="text-xs text-muted-foreground">
                {device.type}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Data Points:</span>
                <span className="font-medium">
                  {device.dataPoints.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Data Points</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <MonitorSmartphone className="h-4 w-4" />
                  <span>{device.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusIndicator status={device.status} />
              </TableCell>
              <TableCell>{device.type}</TableCell>
              <TableCell>{device.dataPoints.toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(device.lastSeen).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <DeviceActions device={device} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const EmptyState = () => (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <MonitorSmartphone className="mb-4 h-12 w-12 text-muted-foreground" />
        <CardTitle className="mb-2 text-xl font-semibold">
          No devices yet
        </CardTitle>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Get started by connecting your first IoT device to begin monitoring
          and managing your devices.
        </p>
        <Button onClick={() => router.push("/devices/first")}>
          <Plus className="mr-2 h-4 w-4" />
          Connect Your First Device
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devices</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your IoT devices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {devices.length > 0 && (
            <>
              <div className="rounded-md border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="px-2"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => router.push("/devices/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            </>
          )}
        </div>
      </div>

      {devices.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </div>
  );
}
