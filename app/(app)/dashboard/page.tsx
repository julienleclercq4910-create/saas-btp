import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/features/kpi-card";
import { ProjectListCard } from "@/components/features/project-list-card";
import { PomodoroWidget } from "@/components/features/pomodoro-widget";
import { Badge } from "@/components/ui/badge";
import { getCompanyScopedData, getDashboardData } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const data = await getDashboardData(ctx.companyId);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Chantiers en cours" value={data.projectsInProgress} />
        <KpiCard label="Taches urgentes" value={data.urgentTasks} />
        <KpiCard label="Documents" value={data.documentsCount} />
        <KpiCard label="Clients" value={data.clientsCount} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ProjectListCard projects={data.latestProjects} />
        </div>
        <PomodoroWidget />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-semibold">Taches du jour</h3>
          <div className="space-y-2">
            {data.tasksToday.length === 0 ? <p className="text-sm text-muted-foreground">Aucune tache prevue aujourd'hui.</p> : null}
            {data.tasksToday.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Echeance: {new Date(task.due_date!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <Badge tone={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}>{task.priority}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold">Productivite rapide</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Le minuteur Pomodoro est local au navigateur. Utilisez-le pour garder un rythme terrain/bureau sans surcharge.
          </p>
        </Card>
      </section>
    </div>
  );
}


