// ~/(main_layout)/layout.tsx

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="ml-64 flex-1">{children}</main>
      </div>
    </div>
  );
}
