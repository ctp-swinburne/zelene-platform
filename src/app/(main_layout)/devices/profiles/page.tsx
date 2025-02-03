"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Settings2,
  Plus,
  MoreVertical,
  LayoutGrid,
  List,
  Radio,
  Laptop2,
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

type DeviceProfile = {
  id: string;
  name: string;
  description: string;
  transport: "mqtt" | "tcp";
  createdAt: string;
  devicesCount: number;
};

type ViewMode = "grid" | "list";

export default function DeviceProfilesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Temporary mock data - replace with actual API call
  const [profiles] = useState<DeviceProfile[]>([
    {
      id: "profile-1",
      name: "Temperature Sensor Profile",
      description: "Profile for temperature monitoring sensors",
      transport: "mqtt",
      createdAt: "2024-02-03T15:30:00",
      devicesCount: 12,
    },
    {
      id: "profile-2",
      name: "Gateway Profile",
      description: "Profile for edge gateways",
      transport: "tcp",
      createdAt: "2024-02-03T15:30:00",
      devicesCount: 5,
    },
  ]);

  const ProfileActions = ({ profile }: { profile: DeviceProfile }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/devices/profiles/${profile.id}`)}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Delete Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const TransportBadge = ({ type }: { type: DeviceProfile["transport"] }) => (
    <div className="flex items-center space-x-2">
      <Radio className="h-3 w-3" />
      <span className="text-sm uppercase text-muted-foreground">{type}</span>
    </div>
  );

  const GridView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laptop2 className="h-5 w-5" />
                <CardTitle className="text-base font-medium">
                  {profile.name}
                </CardTitle>
              </div>
              <ProfileActions profile={profile} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {profile.description}
            </p>
            <div className="flex items-center justify-between">
              <TransportBadge type={profile.transport} />
              <span className="text-sm">
                {profile.devicesCount}{" "}
                {profile.devicesCount === 1 ? "device" : "devices"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Created: {new Date(profile.createdAt).toLocaleDateString()}
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
            <TableHead>Description</TableHead>
            <TableHead>Transport</TableHead>
            <TableHead>Devices</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Laptop2 className="h-4 w-4" />
                  <span>{profile.name}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {profile.description}
              </TableCell>
              <TableCell>
                <TransportBadge type={profile.transport} />
              </TableCell>
              <TableCell>{profile.devicesCount}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(profile.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <ProfileActions profile={profile} />
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
        <Laptop2 className="mb-4 h-12 w-12 text-muted-foreground" />
        <CardTitle className="mb-2 text-xl font-semibold">
          No device profiles yet
        </CardTitle>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Create your first device profile to start organizing and managing your
          IoT devices.
        </p>
        <Button onClick={() => router.push("/devices/profiles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create First Profile
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Device Profiles
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage templates for your IoT devices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {profiles.length > 0 && (
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
              <Button onClick={() => router.push("/devices/profiles/new")}>
                <Plus className="mr-2 h-4 w-4" />
                New Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </div>
  );
}
