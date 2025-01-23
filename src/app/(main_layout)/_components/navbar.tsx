"use client";

import { Home, ChevronRight, Bell, Menu, X } from "lucide-react";
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
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    router.push("/auth/signout");
  };

  const NavItems = () => (
    <>
      <span className="font-semibold">Zelene IoT Platform</span>
      <div className="hidden items-center space-x-2 text-sm text-muted-foreground md:flex">
        <Home size={16} />
        <ChevronRight size={16} />
        <span>Profiles</span>
        <ChevronRight size={16} />
        <span>Device profiles</span>
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
