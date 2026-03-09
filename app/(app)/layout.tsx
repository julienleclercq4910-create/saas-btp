import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentUserContext();
  if (!context?.membership?.company) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar companyName={context.membership.company.name} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


