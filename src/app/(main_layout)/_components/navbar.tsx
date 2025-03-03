"use client";

import { Home, ChevronRight, Bell, Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Helper function to generate gradient colors based on name
const generateGradientColors = (name: string) => {
  const stringToHslColor = (
    str: string,
    saturation: number,
    lightness: number,
  ) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const color1 = stringToHslColor(name, 70, 60);
  const color2 = stringToHslColor(name + name, 70, 60);

  return { color1, color2 };
};

// Type definition for breadcrumb items
type BreadcrumbItem = {
  label: string;
  path: string;
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Generate breadcrumbs based on current path
  useEffect(() => {
    const generateBreadcrumbs = () => {
      // Home is always the first item
      const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

      // Split the path and create breadcrumb items
      const pathSegments = pathname?.split("/").filter(Boolean) || [];

      let currentPath = "";
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;
        // Format the label - capitalize first letter and replace hyphens with spaces
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        items.push({ label, path: currentPath });
      });

      setBreadcrumbs(items);
    };

    generateBreadcrumbs();
  }, [pathname]);

  const handleLogout = () => {
    router.push("/auth/signout");
  };

  // Generate user initials and gradient colors
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const { color1, color2 } = generateGradientColors(
    session?.user?.name ?? "User",
  );

  const NavItems = () => (
    <>
      <span className="font-semibold">Zelene IoT Platform</span>
      <div className="hidden items-center space-x-2 text-sm text-muted-foreground md:flex">
        {breadcrumbs.map((item, index) => (
          <div key={item.path} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="mx-2" />}
            {index === 0 ? (
              <Link
                href={item.path}
                className="flex items-center hover:text-foreground"
              >
                <Home size={16} />
              </Link>
            ) : (
              <Link href={item.path} className="hover:text-foreground">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const UserMenu = () => (
    <div className="flex items-center space-x-4">
      <ModeToggle />
      <Button variant="ghost" size="icon" className="hidden md:flex">
        <Bell size={20} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback
              style={{
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                color: "white",
              }}
            >
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between py-4">
                <span className="font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              {/* Mobile menu content goes here */}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center space-x-4">
          <NavItems />
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
