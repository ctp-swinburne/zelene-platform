"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import {
  BrokerNodeTypeEnum,
  BrokerAuthTypeEnum,
  updateBrokerSchema,
} from "~/schema/broker";
import type { UpdateBrokerInput } from "~/schema/broker";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import { Loader } from "lucide-react";

type Broker = RouterOutputs["broker"]["getById"];

export default function EditBrokerPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Get the broker ID from URL params
  const brokerId = params?.id as string;

  // Get broker data
  const {
    data: broker,
    isLoading: isFetchingBroker,
    error,
  } = api.broker.getById.useQuery(
    { id: brokerId },
    {
      enabled: !!brokerId,
    },
  );

  // Handle error with useEffect instead
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      router.push("/brokers/emqx");
    }
  }, [error, router, toast]);

  // Update mutation
  const updateBrokerMutation = api.broker.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Broker updated",
        description: "Your EMQX broker has been successfully updated.",
      });
      router.push("/brokers");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form definition
  const form = useForm<UpdateBrokerInput>({
    resolver: zodResolver(updateBrokerSchema),
    // We'll set default values after fetching the broker data
    defaultValues: {
      id: brokerId,
    } as UpdateBrokerInput,
  });

  // Watch the auth type to render the appropriate fields
  const authType = form.watch("authType");

  // Update form values when broker data is loaded
  useEffect(() => {
    if (broker) {
      form.reset({
        id: broker.id,
        name: broker.name,
        nodeType: broker.nodeType,
        mqttEnabled: broker.mqttEnabled,
        wsEnabled: broker.wsEnabled,
        sslEnabled: broker.sslEnabled,
        wssEnabled: broker.wssEnabled,
        authType: broker.authType,
        authUsername: broker.authUsername ?? undefined,
        authPassword: broker.authPassword ?? undefined,
        dbHost: broker.dbHost ?? undefined,
        dbPort: broker.dbPort ?? undefined,
        dbName: broker.dbName ?? undefined,
        dbUsername: broker.dbUsername ?? undefined,
        dbPassword: broker.dbPassword ?? undefined,
        jwtSecret: broker.jwtSecret ?? undefined,
        jwtAlgorithm: broker.jwtAlgorithm ?? undefined,
        maxConnections: broker.maxConnections,
        keepAlive: broker.keepAlive,
        enableAcl: broker.enableAcl,
        enableMetrics: broker.enableMetrics,
      });
      setIsLoading(false);
    }
  }, [broker, form]);

  const onSubmit = (data: UpdateBrokerInput) => {
    updateBrokerMutation.mutate(data);
  };

  if (isFetchingBroker || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading broker details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">
            Error loading broker
          </h2>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <Button className="mt-4" onClick={() => router.push("/brokers")}>
            Return to Brokers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Edit EMQX Broker
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your EMQX broker configuration
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="w-full space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Broker Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="production-broker-1"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A unique name for your EMQX broker
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nodeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Node Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select node type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SINGLE">
                                Single Node
                              </SelectItem>
                              <SelectItem value="CLUSTER">Cluster</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Enabled Protocols</Label>
                    <div className="flex flex-wrap gap-4">
                      <FormField
                        control={form.control}
                        name="mqttEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>MQTT (1883)</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>WebSocket (8083)</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sslEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>SSL (8883)</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wssEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>WSS (8084)</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Authentication Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="authType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authentication Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select authentication type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BUILT_IN">
                              Built-in Database
                            </SelectItem>
                            <SelectItem value="MYSQL">MySQL</SelectItem>
                            <SelectItem value="POSTGRES">PostgreSQL</SelectItem>
                            <SelectItem value="MONGODB">MongoDB</SelectItem>
                            <SelectItem value="JWT">JWT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {authType === "BUILT_IN" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="authUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="admin"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="authPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank to keep the current password
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {(authType === "MYSQL" || authType === "POSTGRES") && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dbHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Database Host</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="localhost"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dbPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Port</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    authType === "MYSQL" ? "3306" : "5432"
                                  }
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="dbName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Database Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="emqx_auth"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dbUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="emqx"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dbPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave blank to keep the current password
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {authType === "JWT" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="jwtSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>JWT Secret</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your-jwt-secret"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jwtAlgorithm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>JWT Algorithm</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value ?? "HS256"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HS256">HS256</SelectItem>
                                <SelectItem value="HS384">HS384</SelectItem>
                                <SelectItem value="HS512">HS512</SelectItem>
                                <SelectItem value="RS256">RS256</SelectItem>
                                <SelectItem value="ES256">ES256</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="maxConnections"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Max Connections</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keepAlive"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>TCP Keep Alive (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableAcl"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Enable ACL Rules</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableMetrics"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Enable Metrics Collection</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/brokers")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBrokerMutation.isPending}>
              {updateBrokerMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
