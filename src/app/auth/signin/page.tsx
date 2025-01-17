// ~/pages/auth/signin/page.tsx
"use client";
import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FaDiscord, FaGoogle, FaGithub } from "react-icons/fa";
import { Building2 } from "lucide-react";
import { Separator } from "~/components/ui/separator";

const SignIn: NextPage = () => {
  const providers = [
    {
      id: "google",
      name: "Google",
      icon: <FaGoogle className="h-5 w-5" />,
    },
    {
      id: "discord",
      name: "Discord",
      icon: <FaDiscord className="h-5 w-5" />,
    },
    {
      id: "github",
      name: "GitHub",
      icon: <FaGithub className="h-5 w-5" />,
    },
    {
      id: "azure-ad",
      name: "Microsoft",
      icon: <Building2 className="h-5 w-5" />,
    },
  ];

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
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full"
                onClick={() => void signIn(provider.id, { callbackUrl: "/" })}
              >
                {provider.icon}
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
