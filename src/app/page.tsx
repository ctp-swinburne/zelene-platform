// app/page.tsx

import { type NextPage } from "next";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { MainNav } from "~/components/layout/MainNav";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Lightbulb, Shield } from "lucide-react";
import Link from "next/link";

const Home: NextPage = async () => {
  const session = await auth();
  if (session?.user) {
    redirect("/home");
  }
  return (
    <div>
      <MainNav />

      <main className="container mx-auto px-4 py-16">
        {/* Welcome Section */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Welcome to Zelene IoT Platform
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Control and monitor your IoT infrastructure with our secure IoT
            solution. Get started by creating your account.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>For New Users</CardTitle>
              </div>
              <CardDescription>
                Setting up your account for the first time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-4">
                <li>Register with your personal / organization email</li>
                {/* <li>Verify your account through the confirmation link</li> */}
                <li>Complete your profile with required details</li>
                {/* <li>Wait for administrator approval</li> */}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Platform Access</CardTitle>
              </div>
              <CardDescription>What you&apos;ll be able to do</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-4">
                <li>Monitor device status in real-time</li>
                <li>Control your IoT systems remotely</li>
                <li>Access analytics and reports</li>
                <li>Manage device groups and settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;
