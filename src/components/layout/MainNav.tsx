// ~/components/layout/MainNav.tsx
"use client";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/ui/mode-toggle";
import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function MainNav() {
  const { data: session } = useSession();

  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="text-2xl font-bold">
          <Link href="/">Zelene</Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <User className="h-4 w-4" />
                    <span className="ml-2">{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
