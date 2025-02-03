"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type Route = {
  path: string;
  icon: React.ReactNode;
  title: string;
  children?: Route[];
};

const routes: Route[] = [
  {
    path: "/home",
    icon: <Home size={20} />,
    title: "Home",
  },
  {
    path: "/dashboard",
    icon: <Gauge size={20} />,
    title: "Dashboards",
  },
  {
    path: "/devices",
    icon: <Box size={20} />,
    title: "Devices",
    children: [
      {
        path: "/devices",
        icon: <Server size={20} />,
        title: "Device List",
      },
      {
        path: "/devices/profiles",
        icon: <Layers size={20} />,
        title: "Device Profiles",
      },
    ],
  },
  {
    path: "/brokers",
    icon: <Network size={20} />,
    title: "Brokers",
    children: [
      {
        path: "/brokers/mqtt",
        icon: <Server size={20} />,
        title: "MQTT Brokers",
      },
      {
        path: "/brokers/tcp",
        icon: <Server size={20} />,
        title: "TCP Adapters",
      },
    ],
  },
  {
    path: "/analytics",
    icon: <BarChart2 size={20} />,
    title: "Analytics",
  },
  {
    path: "/alarms",
    icon: <AlertTriangle size={20} />,
    title: "Alarms",
  },
  {
    path: "/notifications",
    icon: <Bell size={20} />,
    title: "Notifications",
  },
  {
    path: "/users",
    icon: <Users size={20} />,
    title: "Users",
  },
  {
    path: "/settings",
    icon: <Settings size={20} />,
    title: "Settings",
  },
];

interface SidebarItemProps {
  route: Route;
  isOpen?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ route, collapsed }: SidebarItemProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === route.path;
  const hasChildren = route.children && route.children.length > 0;

  return (
    <div>
      {hasChildren ? (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            hasChildren && "justify-between",
            collapsed && "px-2",
            isActive && "bg-accent",
          )}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            {route.icon}
            {!collapsed && <span className="ml-2">{route.title}</span>}
          </div>
          {hasChildren &&
            !collapsed &&
            (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </Button>
      ) : (
        <Link href={route.path} passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              collapsed && "px-2",
              isActive && "bg-accent",
            )}
          >
            <div className="flex items-center">
              {route.icon}
              {!collapsed && <span className="ml-2">{route.title}</span>}
            </div>
          </Button>
        </Link>
      )}
      {expanded && !collapsed && route.children && (
        <div className="ml-6 mt-2 space-y-2">
          {route.children.map((child) => (
            <SidebarItem key={child.path} route={child} collapsed={collapsed} />
          ))}
        </div>
      )}
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
          {routes.map((route) => (
            <SidebarItem key={route.path} route={route} collapsed={collapsed} />
          ))}
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
