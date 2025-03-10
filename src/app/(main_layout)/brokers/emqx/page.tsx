"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  MoreVertical,
  Plus,
  Wifi,
  WifiOff,
  Shield,
  Users,
  Settings,
  Play,
  Square,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useToast } from "~/hooks/use-toast";

type Broker = RouterOutputs["broker"]["getAll"][number];
type BrokerStats = RouterOutputs["broker"]["getStats"];

export default function BrokersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);

  // Fetch brokers and stats
  const brokersQuery = api.broker.getAll.useQuery();
  const statsQuery = api.broker.getStats.useQuery();

  const isLoading = brokersQuery.isLoading || statsQuery.isLoading;

  // Mutations
  const deleteBrokerMutation = api.broker.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Broker deleted",
        description: "The broker has been successfully deleted.",
      });
      void brokersQuery.refetch();
      void statsQuery.refetch();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changeStatusMutation = api.broker.changeStatus.useMutation({
    onSuccess: () => {
      toast({
        title: "Status changed",
        description: "The broker status has been updated.",
      });
      void brokersQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle actions
  const handleCreateBroker = () => {
    router.push("/brokers/emqx/create");
  };

  const handleEditBroker = (id: string) => {
    router.push(`/brokers/emqx/edit/${id}`);
  };

  const confirmDeleteBroker = (broker: Broker) => {
    setBrokerToDelete(broker);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBroker = () => {
    if (brokerToDelete) {
      deleteBrokerMutation.mutate({ id: brokerToDelete.id });
    }
  };

  const handleChangeStatus = (id: string, newStatus: "RUNNING" | "STOPPED") => {
    changeStatusMutation.mutate({ id, status: newStatus });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "RUNNING":
        return (
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
        );
      case "STOPPED":
        return (
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Offline</span>
          </div>
        );
      case "ERROR":
        return (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Error</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Stats Cards Skeleton
  const StatsCardsSkeleton = () => (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Broker Cards Skeleton
  const BrokerCardsSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Skeleton className="h-6 w-32" />
              <div className="mt-2">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            EMQX Brokers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your EMQX message brokers and clusters
          </p>
        </div>
        {isLoading ? (
          <Button disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button
            className="flex items-center gap-2"
            onClick={handleCreateBroker}
          >
            <Plus className="h-4 w-4" />
            Add EMQX Broker
          </Button>
        )}
      </div>

      {/* Stats summary cards */}
      {isLoading ? (
        <StatsCardsSkeleton />
      ) : (
        statsQuery.data && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Brokers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsQuery.data.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Running
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {statsQuery.data.running}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stopped
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {statsQuery.data.stopped}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {statsQuery.data.error}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Loading state */}
      {isLoading ? (
        <BrokerCardsSkeleton />
      ) : brokersQuery.isError ? (
        <div className="flex items-center justify-center rounded-lg border border-destructive p-8">
          <div className="flex items-center text-lg text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error loading brokers: {brokersQuery.error.message}
          </div>
        </div>
      ) : brokersQuery.data && brokersQuery.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h3 className="text-lg font-medium">No brokers found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first EMQX broker.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleCreateBroker}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Broker
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brokersQuery.data?.map((broker) => (
            <Card key={broker.id} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-medium">
                    {broker.name}
                  </CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        broker.nodeType === "SINGLE"
                          ? "bg-slate-500/10 text-slate-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {broker.nodeType === "SINGLE"
                        ? "Single Node"
                        : "Clustered"}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditBroker(broker.id)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </DropdownMenuItem>

                    {broker.status === "STOPPED" && (
                      <DropdownMenuItem
                        onClick={() => handleChangeStatus(broker.id, "RUNNING")}
                      >
                        <Play className="mr-2 h-4 w-4 text-green-500" />
                        Start Broker
                      </DropdownMenuItem>
                    )}

                    {broker.status === "RUNNING" && (
                      <DropdownMenuItem
                        onClick={() => handleChangeStatus(broker.id, "STOPPED")}
                      >
                        <Square className="mr-2 h-4 w-4 text-amber-500" />
                        Stop Broker
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/brokers/emqx/${broker.id}/auth`)
                      }
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Authentication
                    </DropdownMenuItem>

                    {broker.enableAcl && (
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/brokers/emqx/${broker.id}/acl`)
                        }
                      >
                        <Users className="mr-2 h-4 w-4" />
                        ACL Rules
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirmDeleteBroker(broker)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <StatusBadge status={broker.status} />

                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Protocols:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {broker.mqttEnabled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary">MQTT:1883</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>MQTT TCP</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {broker.wsEnabled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary">WS:8083</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>MQTT WebSocket</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {broker.sslEnabled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary">SSL:8883</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>MQTT SSL</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {broker.wssEnabled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary">WSS:8084</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>MQTT WebSocket Secure</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Features:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {broker.sslEnabled && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-500"
                        >
                          TLS Enabled
                        </Badge>
                      )}

                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-500"
                      >
                        {broker.authType}
                      </Badge>

                      {broker.enableAcl && (
                        <Badge
                          variant="outline"
                          className="bg-pink-500/10 text-pink-500"
                        >
                          ACL Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {broker.status === "RUNNING" && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        Dashboard:
                      </span>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={() =>
                          window.open(
                            `/brokers/emqx/${broker.id}/dashboard`,
                            "_blank",
                          )
                        }
                      >
                        Open EMQX Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the broker &quot;
              {brokerToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBroker}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
