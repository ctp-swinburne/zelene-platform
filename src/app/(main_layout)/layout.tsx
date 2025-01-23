// ~/(main_layout)/layout.tsx
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
