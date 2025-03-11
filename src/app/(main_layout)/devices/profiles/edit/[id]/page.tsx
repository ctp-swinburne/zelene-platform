"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import { updateProfileSchema } from "~/schema/deviceProfile";
import type { UpdateProfileInput } from "~/schema/deviceProfile";
import { useToast } from "~/hooks/use-toast";

export default function DeviceProfileEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  // Get the profile ID from URL params
  const profileId = params.id as string;

  // Fetch brokers for dropdown
  const { data: brokers } = api.broker.getAll.useQuery();

  // Fetch profile data
  const {
    data: profile,
    isLoading: isFetchingProfile,
    error: profileError,
  } = api.deviceProfile.getById.useQuery(profileId, {
    enabled: !!profileId,
  });

  // Handle error in your component directly using the profileError value
  useEffect(() => {
    if (profileError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile: " + profileError.message,
      });
      router.push("/devices/profiles");
    }
  }, [profileError, router, toast]);

  // Set up the form
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id: profileId,
      brokerId: undefined, // Initialize brokerId field
    } as UpdateProfileInput,
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        id: profile.id,
        name: profile.name,
        description: profile.description ?? undefined,
        transport: profile.transport,
        isDefault: profile.isDefault,
        brokerId: profile.brokerId ?? undefined,
      });
    }
  }, [profile, form]);

  // Update mutation
  const updateProfileMutation = api.deviceProfile.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      router.push("/devices/profiles");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile: " + error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: UpdateProfileInput) => {
    // If brokerId is "none", set it to undefined
    if (data.brokerId === "none") {
      data.brokerId = undefined;
    }
    updateProfileMutation.mutate(data);
  };

  if (isFetchingProfile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <Button onClick={() => router.push("/devices/profiles")}>
          Back to Profiles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Device Profile</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/devices/profiles")}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update the details for your device profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter profile name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Enter profile description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MQTT">MQTT</SelectItem>
                        <SelectItem value="TCP">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add Broker Selection */}
              <FormField
                control={form.control}
                name="brokerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MQTT Broker</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a broker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (No Broker)</SelectItem>
                        {brokers?.map((broker) => (
                          <SelectItem key={broker.id} value={broker.id}>
                            {broker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Associate a broker with this profile. Devices using this
                      profile will inherit this broker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Default Profile</FormLabel>
                      <FormDescription>
                        Set this as the default profile for new devices
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/devices/profiles")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
