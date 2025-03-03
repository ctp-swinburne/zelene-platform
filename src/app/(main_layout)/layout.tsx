// ~/(main_layout)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { Toaster } from "~/components/ui/toaster";

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
        <main className="flex-1 p-4 transition-all duration-300 md:ml-16 lg:ml-64">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
