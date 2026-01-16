// src/components/mqtt/MqttTopicEditor.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { QOS_OPTIONS, DIRECTION_LABELS, resolveTopic } from "~/lib/mqtt-utils";
import type { MqttDirection } from "~/schema/mqttTopic";
import { Plus, Trash2, Edit, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export type MqttTopic = {
  id?: string;
  name: string;
  description?: string | null;
  topicPattern: string;
  direction: MqttDirection;
  qos: number;
  retain: boolean;
  profileId?: string;
};

type MqttTopicEditorProps = {
  topics: MqttTopic[];
  onTopicsChange: (topics: MqttTopic[]) => void;
  previewDeviceId?: string;
  onPreviewDeviceIdChange?: (deviceId: string) => void;
  readOnly?: boolean;
};

export function MqttTopicEditor({
  topics,
  onTopicsChange,
  previewDeviceId = "device-id",
  onPreviewDeviceIdChange,
  readOnly = false,
}: MqttTopicEditorProps) {
  const [newTopic, setNewTopic] = useState<MqttTopic>({
    name: "",
    description: "",
    topicPattern: "",
    direction: "SUBSCRIBE",
    qos: 0,
    retain: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle form submission
  const handleSubmit = () => {
    if (editMode && editIndex !== null) {
      // Update existing topic
      const updatedTopics = [...topics];
      if (editIndex >= 0 && editIndex < topics.length && topics[editIndex]) {
        updatedTopics[editIndex] = { ...newTopic, id: topics[editIndex].id };
      }

      onTopicsChange(updatedTopics);
    } else {
      // Add new topic
      onTopicsChange([...topics, newTopic]);
    }

    // Reset form and close dialog
    setNewTopic({
      name: "",
      description: "",
      topicPattern: "",
      direction: "SUBSCRIBE",
      qos: 0,
      retain: false,
    });
    setEditMode(false);
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  // Handle editing a topic
  const handleEditTopic = (index: number) => {
    setEditMode(true);
    setEditIndex(index);

    // Fix: Check if topic at index exists
    if (index >= 0 && index < topics.length && topics[index]) {
      const topicToEdit = topics[index];
      setNewTopic({
        id: topicToEdit.id,
        name: topicToEdit.name,
        description: topicToEdit.description,
        topicPattern: topicToEdit.topicPattern,
        direction: topicToEdit.direction,
        qos: topicToEdit.qos,
        retain: topicToEdit.retain,
        profileId: topicToEdit.profileId,
      });
      setIsDialogOpen(true);
    }
  };
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const updatedTopics = topics.filter((_, index) => index !== deleteIndex);
      onTopicsChange(updatedTopics);
      setDeleteIndex(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to get the badge color based on direction
  const getDirectionBadgeColor = (direction: MqttDirection) => {
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
    <div className="space-y-4">
      {/* Preview Device ID Input */}
      {onPreviewDeviceIdChange && (
        <div className="mb-6 flex items-center space-x-2">
          <Label htmlFor="previewDeviceId" className="whitespace-nowrap">
            Preview Device ID:
          </Label>
          <Input
            id="previewDeviceId"
            value={previewDeviceId}
            onChange={(e) => onPreviewDeviceIdChange(e.target.value)}
            className="max-w-xs"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCw className="h-4 w-4 cursor-pointer text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Use to see how topics will look with actual device IDs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Topics Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">MQTT Topics</CardTitle>
            <CardDescription>
              Configure how devices will communicate using MQTT
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setEditIndex(null);
                    setNewTopic({
                      name: "",
                      description: "",
                      topicPattern: "",
                      direction: "SUBSCRIBE",
                      qos: 0,
                      retain: false,
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? "Edit MQTT Topic" : "Add MQTT Topic"}
                  </DialogTitle>
                  <DialogDescription>
                    {editMode
                      ? "Modify the MQTT topic configuration"
                      : "Configure a new MQTT topic for this device profile"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="topicName">Topic Name</Label>
                    <Input
                      id="topicName"
                      placeholder="e.g., Device Status, Sensor Readings"
                      value={newTopic.name}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicDescription">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="topicDescription"
                      placeholder="Describe the purpose of this topic"
                      value={newTopic.description ?? ""}
                      onChange={(e) =>
                        setNewTopic({
                          ...newTopic,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicPattern">Topic Pattern</Label>
                    <Input
                      id="topicPattern"
                      placeholder="e.g., devices/{deviceId}/status"
                      value={newTopic.topicPattern}
                      onChange={(e) =>
                        setNewTopic({
                          ...newTopic,
                          topicPattern: e.target.value,
                        })
                      }
                    />
                    {newTopic.topicPattern && (
                      <p className="text-xs text-muted-foreground">
                        Preview:{" "}
                        <span className="font-mono">
                          {resolveTopic(newTopic.topicPattern, previewDeviceId)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={newTopic.direction}
                      onValueChange={(value: MqttDirection) =>
                        setNewTopic({ ...newTopic, direction: value })
                      }
                    >
                      <SelectTrigger id="direction">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLISH">
                          {DIRECTION_LABELS.PUBLISH}
                        </SelectItem>
                        <SelectItem value="SUBSCRIBE">
                          {DIRECTION_LABELS.SUBSCRIBE}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qos">QoS Level</Label>
                    <Select
                      value={newTopic.qos.toString()}
                      onValueChange={(value) =>
                        setNewTopic({ ...newTopic, qos: parseInt(value) })
                      }
                    >
                      <SelectTrigger id="qos">
                        <SelectValue placeholder="Select QoS" />
                      </SelectTrigger>
                      <SelectContent>
                        {QOS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="retain"
                      checked={newTopic.retain}
                      onCheckedChange={(checked) =>
                        setNewTopic({ ...newTopic, retain: checked })
                      }
                    />
                    <Label htmlFor="retain">Retain Messages</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmit}>
                    {editMode ? "Save Changes" : "Add Topic"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed p-8 text-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  No MQTT topics configured
                </p>
                {!readOnly && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click &quot;Add Topic&quot; to configure MQTT communication
                    for devices using this profile
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Topic Pattern</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>QoS</TableHead>
                    <TableHead>Retain</TableHead>
                    {!readOnly && (
                      <TableHead className="w-[100px]">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic, index) => (
                    <TableRow key={topic.id ?? index}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{topic.name}</div>
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
                      {!readOnly && (
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTopic(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <AlertDialog
                              open={isDeleteDialogOpen && deleteIndex === index}
                              onOpenChange={(open) => {
                                setIsDeleteDialogOpen(open);
                                if (!open) setDeleteIndex(null);
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteIndex(index);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete MQTT Topic
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the topic
                                    &quot;
                                    {topic.name}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
