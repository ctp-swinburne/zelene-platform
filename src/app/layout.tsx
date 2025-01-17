// ~/app/layout.tsx
import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/providers/ThemeProvider";
import { SessionProvider } from "next-auth/react"; // Add this import

export const metadata: Metadata = {
  title: "Zelene IoT",
  description: "IoT Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            {" "}
            {/* Add this wrapper */}
            <ThemeProvider>{children}</ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
