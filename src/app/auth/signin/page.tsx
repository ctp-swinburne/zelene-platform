"use client";

import { type NextPage } from "next";
import { useState, useEffect } from "react";
import { type BuiltInProviderType } from "next-auth/providers";
import { type LiteralUnion, signIn, getProviders } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { FaDiscord, FaGoogle, FaGithub } from "react-icons/fa";
import { Building2 } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

const SignIn: NextPage = () => {
  const [providers, setProviders] = useState<Record<
    LiteralUnion<BuiltInProviderType>,
    {
      id: string;
      name: string;
      type: string;
      signinUrl: string;
      callbackUrl: string;
    }
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProviders = async () => {
      try {
        const availableProviders = await getProviders();
        setProviders(availableProviders);
      } catch (err) {
        setError("Failed to load authentication providers");
        console.error("Error loading providers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeProviders();
  }, []);

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "google":
        return <FaGoogle className="h-5 w-5" />;
      case "discord":
        return <FaDiscord className="h-5 w-5" />;
      case "github":
        return <FaGithub className="h-5 w-5" />;
      case "azure-ad":
        return <Building2 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const oauthProviders = providers
    ? Object.values(providers).filter(
        (provider) => provider.type === "oauth" || provider.type === "oidc",
      )
    : [];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {oauthProviders.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full"
                onClick={() => void signIn(provider.id, { callbackUrl: "/" })}
              >
                {getProviderIcon(provider.id)}
                <span className="ml-2">Continue with {provider.name}</span>
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Protected Access
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
