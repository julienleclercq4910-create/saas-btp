import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth";

export default async function Home() {
  const context = await getCurrentUserContext();
  redirect(context ? "/dashboard" : "/login");
}


