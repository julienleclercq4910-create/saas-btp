import { startOfDay, endOfDay } from "date-fns";
import { createClient } from "@/lib/supabase-server";

export async function getCompanyScopedData() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase.from("memberships").select("company_id, role").eq("user_id", user.id).single();
  if (!membership) return null;

  return { supabase, user, companyId: membership.company_id, role: membership.role as "admin" | "member" };
}

export async function getDashboardData(companyId: string) {
  const supabase = await createClient();
  const [projects, urgentTasks, docs, clients, latestProjects, todayTasks] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "in_progress"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("priority", "urgent").neq("status", "done"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("projects").select("id,name,status,progress").eq("company_id", companyId).order("created_at", { ascending: false }).limit(5),
    supabase
      .from("tasks")
      .select("id,title,priority,status,due_date")
      .eq("company_id", companyId)
      .gte("due_date", startOfDay(new Date()).toISOString())
      .lte("due_date", endOfDay(new Date()).toISOString())
      .order("due_date", { ascending: true })
      .limit(8)
  ]);

  return {
    projectsInProgress: projects.count || 0,
    urgentTasks: urgentTasks.count || 0,
    documentsCount: docs.count || 0,
    clientsCount: clients.count || 0,
    latestProjects: latestProjects.data || [],
    tasksToday: todayTasks.data || []
  };
}


