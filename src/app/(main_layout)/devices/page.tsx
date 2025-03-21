"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  MonitorSmartphone,
  Plus,
  Settings2,
  MoreVertical,
  LayoutGrid,
  List,
  Loader2,
  Server,
  Layers,
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
import { useToast } from "~/hooks/use-toast";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Device = RouterOutputs["device"]["getAll"][0];
type ViewMode = "grid" | "list";

export default function DevicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch devices using tRPC
  const { data: devices, refetch, isLoading } = api.device.getAll.useQuery();

  // Delete mutation
  const deleteDevice = api.device.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      void refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await deleteDevice.mutateAsync(deviceId);
    } catch (error) {
      // Error handling is done in onError callback
      console.error("Error deleting device:", error);
    }
  };

  const DeviceActions = ({ device }: { device: Device }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/devices/edit/${device.id}`)}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDeleteDevice(device.id)}
          className="text-destructive"
        >
          Delete Device
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const StatusIndicator = ({ status }: { status: Device["status"] }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "ONLINE" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm capitalize text-muted-foreground">
        {status.toLowerCase()}
      </span>
    </div>
  );

  // Helper to determine if broker is inherited from profile
  const isBrokerInherited = (device: Device) => {
    return (
      device.profileId &&
      device.profile?.brokerId &&
      device.brokerId === device.profile?.brokerId
    );
  };

  const GridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices?.map((device) => (
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
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusIndicator status={device.status} />
              {device.profile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {device.profile?.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Using device profile: {device.profile?.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Broker Information */}
            {device.broker && (
              <div className="flex items-center space-x-1">
                <Server
                  className={`h-3.5 w-3.5 ${isBrokerInherited(device) ? "text-blue-400" : "text-blue-500"}`}
                />
                <span
                  className={`text-xs ${isBrokerInherited(device) ? "text-blue-400" : "text-blue-500"}`}
                >
                  {device.broker.name}
                  {isBrokerInherited(device) && " (inherited)"}
                </span>
              </div>
            )}
            {!device.broker && (
              <div className="flex items-center space-x-1">
                <Server className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  No broker connected
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Device ID:</span>
                <span className="font-mono text-xs">{device.deviceId}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {device.lastSeen
                  ? `Last seen: ${new Date(device.lastSeen).toLocaleTimeString()}`
                  : "Never connected"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const GridSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
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
            <TableHead>Profile</TableHead>
            <TableHead>Broker</TableHead>
            <TableHead>Device ID</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices?.map((device) => (
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
              <TableCell>
                {device.profile ? (
                  <div className="flex items-center space-x-1">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span>{device.profile.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No Profile</span>
                )}
              </TableCell>
              <TableCell>
                {device.broker ? (
                  <div className="flex items-center space-x-1">
                    <Server
                      className={`h-4 w-4 ${isBrokerInherited(device) ? "text-blue-400" : "text-blue-500"}`}
                    />
                    <span
                      className={
                        isBrokerInherited(device)
                          ? "text-blue-400"
                          : "text-blue-500"
                      }
                    >
                      {device.broker.name}
                      {isBrokerInherited(device) && (
                        <span className="ml-1 text-xs">(inherited)</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {device.deviceId}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {device.lastSeen
                  ? new Date(device.lastSeen).toLocaleTimeString()
                  : "Never connected"}
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

  const ListSkeleton = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Broker</TableHead>
            <TableHead>Device ID</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
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

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading devices...</p>
      </div>
    </div>
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
          {!isLoading && devices && devices.length > 0 && (
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
          {isLoading && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <GridSkeleton />
        ) : (
          <ListSkeleton />
        )
      ) : !devices?.length ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </div>
  );
}
