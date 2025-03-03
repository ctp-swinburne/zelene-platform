"use client";
// ~/(main_layout)/home/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Plus,
  Box,
  Server,
  Zap,
  ArrowRight,
  BarChart2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function Home() {
  const quickStartSteps = [
    {
      title: "Connect Your First Device",
      description: "Set up and connect an IoT device to start monitoring",
      icon: Box,
      href: "/devices/first",
    },
    {
      title: "Configure MQTT Broker",
      description: "Set up communication between your devices and platform",
      icon: Server,
      href: "/brokers",
    },
    {
      title: "Create Dashboard",
      description: "Build custom dashboards to visualize your device data",
      icon: BarChart2,
      href: "/dashboards/new",
    },
  ];

  const stats = [
    {
      label: "Total Devices",
      value: "0",
      tooltip: "Total number of registered IoT devices",
    },
    {
      label: "Active Devices",
      value: "0",
      tooltip: "Number of devices currently online and sending data",
    },
    {
      label: "Data Points Today",
      value: "0",
      tooltip:
        "Total number of sensor readings and measurements collected today",
    },
    {
      label: "Active Alerts",
      value: "0",
      tooltip: "Number of unresolved alerts from your devices",
    },
  ];

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Zelene IoT Platform
        </h1>
        <p className="text-muted-foreground">
          Get started by connecting your devices and creating dashboards to
          monitor your IoT ecosystem
        </p>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertTitle>Getting Started</AlertTitle>
        <AlertDescription>
          Complete these quick steps to set up your IoT environment
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        {quickStartSteps.map((step, i) => (
          <Card key={i} className="transition-colors hover:bg-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {step.title}
              </CardTitle>
              <step.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {step.description}
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={step.href}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <TooltipProvider key={i}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  {stat.label}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </TooltipProvider>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="ghost">
              <Plus className="mr-2 h-4 w-4" />
              Add New Device
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <Plus className="mr-2 h-4 w-4" />
              Create Dashboard
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <Plus className="mr-2 h-4 w-4" />
              Configure Alert
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
