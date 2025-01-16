// ~/components/layout/MainNav.tsx
import { Button } from "~/components/ui/button";
import { ModeToggle } from "~/components/ui/mode-toggle";
import Link from "next/link";
import { LogIn } from "lucide-react";

export function MainNav() {
  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="text-2xl font-bold">
          <Link href="/">Zelene</Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/auth/signin">
            <Button>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
