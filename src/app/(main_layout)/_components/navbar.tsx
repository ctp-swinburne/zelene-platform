// ~/(main_layout)/_components/navbar.tsx
"use client";
import { Home, ChevronRight, Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ModeToggle } from "~/components/ui/mode-toggle";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/signout");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Zelene IoT Platform</span>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home size={16} />
            <ChevronRight size={16} />
            <span>Profiles</span>
            <ChevronRight size={16} />
            <span>Device profiles</span>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>TD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
