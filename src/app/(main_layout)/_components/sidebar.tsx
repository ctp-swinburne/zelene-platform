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
  MenuIcon,
  X,
} from "lucide-react";
import { useMediaQuery } from "~/app/hooks/use-media-query";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  isOpen?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode;
  collapsed?: boolean;
}

function SidebarItem({
  icon,
  title,
  isOpen,
  hasChildren,
  children,
  collapsed,
}: SidebarItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          hasChildren && "justify-between",
          collapsed && "px-2",
        )}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {icon}
          {!collapsed && <span className="ml-2">{title}</span>}
        </div>
        {hasChildren &&
          !collapsed &&
          (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
      </Button>
      {expanded && !collapsed && children}
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const sidebarClass = cn(
    "fixed h-[calc(100vh-4rem)] bg-background transition-all duration-300",
    isDesktop ? sidebarWidth : "w-64",
    isDesktop ? "left-0" : isMobileOpen ? "left-0" : "-left-64",
    "z-40 border-r",
  );

  const toggleSidebar = () => {
    if (isDesktop) {
      setCollapsed(!collapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <MenuIcon size={20} />
      </Button>

      <div className={sidebarClass}>
        <div className="flex justify-end p-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-2 p-4">
          <SidebarItem
            icon={<Home size={20} />}
            title="Home"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Gauge size={20} />}
            title="Dashboards"
            collapsed={collapsed}
          />

          <SidebarItem
            icon={<Box size={20} />}
            title="Devices"
            hasChildren
            collapsed={collapsed}
          >
            <div className="ml-6 mt-2 space-y-2">
              <SidebarItem
                icon={<Server size={20} />}
                title="Device Profiles"
                collapsed={collapsed}
              />
              <SidebarItem
                icon={<Layers size={20} />}
                title="Asset Profiles"
                collapsed={collapsed}
              />
            </div>
          </SidebarItem>

          <SidebarItem
            icon={<Network size={20} />}
            title="Brokers"
            hasChildren
            collapsed={collapsed}
          >
            <div className="ml-6 mt-2 space-y-2">
              <SidebarItem
                icon={<Server size={20} />}
                title="MQTT Brokers"
                collapsed={collapsed}
              />
              <SidebarItem
                icon={<Server size={20} />}
                title="TCP Adapters"
                collapsed={collapsed}
              />
            </div>
          </SidebarItem>

          <SidebarItem
            icon={<BarChart2 size={20} />}
            title="Analytics"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<AlertTriangle size={20} />}
            title="Alarms"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Bell size={20} />}
            title="Notifications"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Users size={20} />}
            title="Users"
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            title="Settings"
            collapsed={collapsed}
          />
        </div>
      </div>

      {!isDesktop && isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
