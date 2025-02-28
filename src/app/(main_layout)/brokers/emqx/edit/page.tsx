"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BrokerEditCatch() {
  const router = useRouter();

  useEffect(() => {
    // Redirect back to the previous page after a short delay
    const timer = setTimeout(() => {
      router.back();
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Route</AlertTitle>
        <AlertDescription>
          You&apos;ve accessed an edit page without specifying a broker ID. You
          will be redirected back automatically.
        </AlertDescription>
      </Alert>

      <Button variant="default" onClick={() => router.back()} className="mt-4">
        Go Back
      </Button>
    </div>
  );
}
