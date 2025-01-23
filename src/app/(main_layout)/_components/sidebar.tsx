// ~/(main_layout)/_components/sidebar.tsx
"use client";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Home,
  BarChart2,
  Bell,
  Settings,
  Users,
  Box,
  Server,
  Layers,
  AlertTriangle,
  Gauge,
  Network,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  isOpen?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode;
}

function SidebarItem({
  icon,
  title,
  isOpen,
  hasChildren,
  children,
}: SidebarItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        className={cn("w-full justify-start", hasChildren && "justify-between")}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        {hasChildren &&
          (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </Button>
      {expanded && children}
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="fixed left-0 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <div className="space-y-2 p-4">
        <SidebarItem icon={<Home size={20} />} title="Home" />
        <SidebarItem icon={<Gauge size={20} />} title="Dashboards" />

        <SidebarItem icon={<Box size={20} />} title="Devices" hasChildren>
          <div className="ml-6 mt-2 space-y-2">
            <SidebarItem icon={<Server size={20} />} title="Device Profiles" />
            <SidebarItem icon={<Layers size={20} />} title="Asset Profiles" />
          </div>
        </SidebarItem>

        <SidebarItem icon={<Network size={20} />} title="Brokers" hasChildren>
          <div className="ml-6 mt-2 space-y-2">
            <SidebarItem icon={<Server size={20} />} title="MQTT Brokers" />
            <SidebarItem icon={<Server size={20} />} title="Manage Brokers" />
          </div>
        </SidebarItem>

        <SidebarItem icon={<BarChart2 size={20} />} title="Analytics" />
        <SidebarItem icon={<AlertTriangle size={20} />} title="Alarms" />
        <SidebarItem icon={<Bell size={20} />} title="Notifications" />
        <SidebarItem icon={<Users size={20} />} title="Users" />
        <SidebarItem icon={<Settings size={20} />} title="Settings" />
      </div>
    </div>
  );
}
