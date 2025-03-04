// ~/app/brokers/page.tsx
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Link from "next/link";
import { Icons } from "~/components/icons";

export default function BrokersIndexPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">IoT Broker Management</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* EMQX Brokers Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.server className="h-5 w-5" />
              EMQX Brokers
            </CardTitle>
            <CardDescription>
              Configure and manage MQTT brokers for your IoT devices
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              EMQX brokers provide reliable MQTT messaging services for your IoT
              ecosystem. They handle device connections, message routing, and
              ensure secure communication between your devices and applications.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/brokers/emqx">Manage EMQX Brokers</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* TCP Adapters Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.network className="h-5 w-5" />
              TCP Adapters
            </CardTitle>
            <CardDescription>
              Configure TCP adapters for non-MQTT device connections
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm">
              TCP adapters enable communication with devices that don&apos;t
              natively support MQTT. They translate between TCP-based protocols
              and MQTT, allowing seamless integration of legacy or specialized
              devices into your IoT ecosystem.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/brokers/tcp">Manage TCP Adapters</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Getting Started with Brokers
        </h2>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mqtt">MQTT Basics</TabsTrigger>
            <TabsTrigger value="tcp">TCP Basics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-2 rounded-md border p-4">
            <p>
              IoT brokers act as message intermediaries between devices and your
              applications. They handle device connections, message routing, and
              ensure reliable communication. Choose the appropriate broker type
              based on your device requirements and network topology.
            </p>
          </TabsContent>
          <TabsContent value="mqtt" className="mt-2 rounded-md border p-4">
            <p>
              MQTT (Message Queuing Telemetry Transport) is a lightweight
              publish/subscribe protocol designed for constrained devices and
              low-bandwidth, high-latency networks. MQTT brokers handle message
              routing using topics, QoS levels, and optional persistence.
            </p>
          </TabsContent>
          <TabsContent value="tcp" className="mt-2 rounded-md border p-4">
            <p>
              TCP adapters bridge non-MQTT devices to your MQTT ecosystem. They
              listen for TCP connections, parse incoming data according to your
              configuration, and publish the translated data to your MQTT
              broker. This enables integration of legacy or specialized devices
              without native MQTT support.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
