// ~/app/auth/error/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertTriangle } from "lucide-react";

// Changed to a proper named React component function declaration
function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link has expired or has already been used.";
      default:
        return "An unexpected error occurred.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center text-2xl">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            {error
              ? getErrorMessage(error)
              : "An error occurred during authentication"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full max-w-xs"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Make sure to export the component as default
export default ErrorPage;
