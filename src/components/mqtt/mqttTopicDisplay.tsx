// src/components/mqtt/MqttTopicDisplay.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DIRECTION_LABELS, resolveTopic } from "~/lib/mqtt-utils";
import type { MqttTopic } from "~/components/mqtt/mqttTopicEditor";

type MqttTopicDisplayProps = {
  topics: MqttTopic[];
  deviceId?: string;
  title?: string;
  showDeviceIdInput?: boolean;
};

export function MqttTopicDisplay({
  topics,
  deviceId = "device-id",
  title = "MQTT Topics",
  showDeviceIdInput = true,
}: MqttTopicDisplayProps) {
  const [previewDeviceId, setPreviewDeviceId] = useState(deviceId);

  // Function to get the badge color based on direction
  const getDirectionBadgeColor = (direction: string) => {
    return direction === "PUBLISH"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  // Function to get the badge color based on QoS
  const getQoSBadgeColor = (qos: number) => {
    switch (qos) {
      case 0:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
      case 1:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 2:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {showDeviceIdInput && (
          <div className="mb-6 flex items-center space-x-2">
            <Label htmlFor="previewDeviceId" className="whitespace-nowrap">
              Device ID:
            </Label>
            <Input
              id="previewDeviceId"
              value={previewDeviceId}
              onChange={(e) => setPreviewDeviceId(e.target.value)}
              className="max-w-xs"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RefreshCw className="h-4 w-4 cursor-pointer text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>See how topics will look with this device ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {topics.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                No MQTT topics configured
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>QoS</TableHead>
                  <TableHead>Retain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic, index) => (
                  <TableRow key={topic.id ?? index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        {topic.description && (
                          <div className="text-xs text-muted-foreground">
                            {topic.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-xs text-muted-foreground">
                          {topic.topicPattern}
                        </div>
                        <div className="font-mono text-xs">
                          {resolveTopic(topic.topicPattern, previewDeviceId)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getDirectionBadgeColor(topic.direction)}
                        variant="outline"
                      >
                        {DIRECTION_LABELS[topic.direction]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getQoSBadgeColor(topic.qos)}
                        variant="outline"
                      >
                        QoS {topic.qos}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {topic.retain ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800"
                        >
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
