"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import {
  BrokerNodeTypeEnum,
  BrokerAuthTypeEnum,
  createBrokerSchema,
} from "~/schema/broker";
import type { CreateBrokerInput } from "~/schema/broker";

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

export default function CreateBrokerForm() {
  const router = useRouter();
  const { toast } = useToast();

  // Create mutation
  const createBrokerMutation = api.broker.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Broker created",
        description: "Your EMQX broker has been successfully created.",
      });
      router.push("/brokers/emqx");
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
  const form = useForm<CreateBrokerInput>({
    resolver: zodResolver(createBrokerSchema),
    defaultValues: {
      name: "",
      nodeType: "SINGLE",
      mqttEnabled: true,
      wsEnabled: true,
      sslEnabled: false,
      wssEnabled: false,
      authType: "BUILT_IN",
      maxConnections: 1000000,
      keepAlive: 300,
      enableAcl: false,
      enableMetrics: false,
    },
  });

  const authType = form.watch("authType");

  const onSubmit = (data: CreateBrokerInput) => {
    createBrokerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create EMQX Broker
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your EMQX broker instance and authentication method
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
                              <Input placeholder="admin" {...field} />
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
                              />
                            </FormControl>
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
                                <Input placeholder="localhost" {...field} />
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
                              <Input placeholder="emqx_auth" {...field} />
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
                                <Input placeholder="emqx" {...field} />
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
                                />
                              </FormControl>
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
                              <Input placeholder="your-jwt-secret" {...field} />
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
              onClick={() => router.push("/brokers/emqx")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBrokerMutation.isPending}>
              {createBrokerMutation.isPending ? "Creating..." : "Deploy Broker"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
