// ~/pages/auth/signout/post.tsx
"use client";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";

const SignOut: NextPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Sign Out</CardTitle>
          <CardDescription className="text-center">
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="w-full max-w-xs"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignOut;
