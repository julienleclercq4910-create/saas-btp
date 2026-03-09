import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentUserContext();
  if (context) redirect("/dashboard");

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-card">{children}</div>
    </div>
  );
}


