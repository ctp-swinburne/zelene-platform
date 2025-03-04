"use client";

import { useEffect, useState } from "react";
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
        path: "/brokers/emqx",
        icon: <Server size={20} />,
        title: "EMQX Brokers",
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

// Function to generate an ID subsection
function IdSubsection({
  path,
  id,
  icon,
  pathname,
  collapsed,
}: {
  path: string;
  id: string;
  icon: React.ReactNode;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <Link href={`${path}/${id}`} passHref>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start",
          collapsed && "px-2",
          pathname.startsWith(`${path}/${id}`) && "bg-accent",
        )}
      >
        <div className="flex items-center">
          {icon}
          {!collapsed && (
            <span className="ml-2 text-sm font-medium">
              ID: {id.slice(0, 8)}...
            </span>
          )}
        </div>
      </Button>
    </Link>
  );
}

interface SidebarItemProps {
  route: Route;
  collapsed?: boolean;
  pathname: string;
  openItems: string[];
  setOpenItems: (paths: string[]) => void;
}

function SidebarItem({
  route,
  collapsed,
  pathname,
  openItems,
  setOpenItems,
}: SidebarItemProps) {
  const hasChildren = route.children && route.children.length > 0;

  // Check if this route or any of its children match the current path
  const isExactMatch = pathname === route.path;
  const isParentOfCurrentRoute =
    hasChildren && pathname.startsWith(route.path + "/");
  const isExpanded = openItems.includes(route.path);

  // Helper function to toggle expansion
  const toggleExpansion = () => {
    if (isExpanded) {
      setOpenItems(openItems.filter((path) => path !== route.path));
    } else {
      setOpenItems([...openItems, route.path]);
    }
  };

  // Extract device ID from pathname if it matches the pattern /devices/someId
  const deviceIdMatch = /^\/devices\/([^\/]+)(?:\/|$)/.exec(pathname);
  const deviceId =
    deviceIdMatch && deviceIdMatch[1] !== "profiles" ? deviceIdMatch[1] : null;

  // Extract device profile ID from pathname if it matches the pattern /devices/profiles/someId
  const profileIdMatch = /^\/devices\/profiles\/([^\/]+)(?:\/|$)/.exec(
    pathname,
  );
  const profileId = profileIdMatch ? profileIdMatch[1] : null;

  // Extract broker ID from pathname if it matches the pattern /brokers/emqx/someId
  const brokerIdMatch = /^\/brokers\/emqx\/([^\/]+)(?:\/|$)/.exec(pathname);
  const brokerId = brokerIdMatch ? brokerIdMatch[1] : null;

  return (
    <div>
      {hasChildren ? (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            hasChildren && "justify-between",
            collapsed && "px-2",
            (isExactMatch || isParentOfCurrentRoute) && "bg-accent",
          )}
          onClick={toggleExpansion}
        >
          <div className="flex items-center">
            {route.icon}
            {!collapsed && <span className="ml-2">{route.title}</span>}
          </div>
          {hasChildren &&
            !collapsed &&
            (isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            ))}
        </Button>
      ) : (
        <Link href={route.path} passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              collapsed && "px-2",
              isExactMatch && "bg-accent",
            )}
          >
            <div className="flex items-center">
              {route.icon}
              {!collapsed && <span className="ml-2">{route.title}</span>}
            </div>
          </Button>
        </Link>
      )}

      {isExpanded && !collapsed && (
        <div className="ml-6 mt-2 space-y-2">
          {/* Render regular children */}
          {route.children?.map((child) => (
            <div key={child.path}>
              <SidebarItem
                route={child}
                collapsed={collapsed}
                pathname={pathname}
                openItems={openItems}
                setOpenItems={setOpenItems}
              />

              {/* Show device ID subsection under Device List */}
              {child.path === "/devices" && deviceId && (
                <div className="ml-6 mt-2">
                  <IdSubsection
                    path="/devices"
                    id={deviceId}
                    icon={<Server size={20} />}
                    pathname={pathname}
                    collapsed={collapsed ?? false}
                  />
                </div>
              )}

              {/* Show profile ID subsection under Device Profiles */}
              {child.path === "/devices/profiles" && profileId && (
                <div className="ml-6 mt-2">
                  <IdSubsection
                    path="/devices/profiles"
                    id={profileId}
                    icon={<Layers size={20} />}
                    pathname={pathname}
                    collapsed={collapsed ?? false}
                  />
                </div>
              )}

              {/* Show broker ID subsection under EMQX Brokers */}
              {child.path === "/brokers/emqx" && brokerId && (
                <div className="ml-6 mt-2">
                  <IdSubsection
                    path="/brokers/emqx"
                    id={brokerId}
                    icon={<Server size={20} />}
                    pathname={pathname}
                    collapsed={collapsed ?? false}
                  />
                </div>
              )}
            </div>
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
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Auto-expand sidebar items based on current path
  useEffect(() => {
    // Find parent routes that should be expanded based on current path
    const pathsToExpand = routes
      .filter(
        (route) =>
          route.children &&
          (pathname.startsWith(route.path + "/") || pathname === route.path),
      )
      .map((route) => route.path);

    // Always expand devices if we're on a device page
    if (
      pathname.startsWith("/devices/") &&
      !pathsToExpand.includes("/devices")
    ) {
      pathsToExpand.push("/devices");
    }

    // Always expand brokers if we're on a broker page
    if (
      pathname.startsWith("/brokers/") &&
      !pathsToExpand.includes("/brokers")
    ) {
      pathsToExpand.push("/brokers");
    }

    setOpenItems(pathsToExpand);
  }, [pathname]);

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
            <SidebarItem
              key={route.path}
              route={route}
              collapsed={collapsed}
              pathname={pathname}
              openItems={openItems}
              setOpenItems={setOpenItems}
            />
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
