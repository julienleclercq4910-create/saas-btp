import { redirect } from "next/navigation";
import { createTaskAction, deleteTaskAction, updateTaskAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TD, TH } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ priority?: string; status?: string }> }) {
  const params = await searchParams;
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const tasksQuery = ctx.supabase
    .from("tasks")
    .select("id,title,description,priority,status,due_date,project_id,project:projects(name)")
    .eq("company_id", ctx.companyId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (params.priority) tasksQuery.eq("priority", params.priority);
  if (params.status) tasksQuery.eq("status", params.status);

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    tasksQuery,
    ctx.supabase.from("projects").select("id,name").eq("company_id", ctx.companyId).order("name")
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Taches</h1>
        <p className="text-sm text-muted-foreground">Filtrez par urgence et statut pour le pilotage quotidien.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Nouvelle tache</h2>
        <form action={createTaskAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input name="title" placeholder="Titre" required />
          <Input name="description" placeholder="Description" />
          <Select name="priority" defaultValue="medium">
            <option value="low">faible</option>
            <option value="medium">moyenne</option>
            <option value="high">haute</option>
            <option value="urgent">urgente</option>
          </Select>
          <Select name="status" defaultValue="todo">
            <option value="todo">a faire</option>
            <option value="in_progress">en cours</option>
            <option value="blocked">bloquee</option>
            <option value="done">terminee</option>
          </Select>
          <Input name="due_date" type="datetime-local" />
          <Select name="project_id">
            <option value="">Chantier (optionnel)</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit">Ajouter la tache</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <a href="/tasks" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">Tous</a>
          <a href="/tasks?priority=urgent" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">Urgentes</a>
          <a href="/tasks?status=todo" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">A faire</a>
          <a href="/tasks?status=done" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">Terminees</a>
        </div>
        <Table>
          <thead>
            <tr className="border-b border-border">
              <TH>Titre</TH>
              <TH>Chantier</TH>
              <TH>Priorite</TH>
              <TH>Statut</TH>
              <TH>Echeance</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {tasks?.map((task) => {
              const project = one(task.project);
              return (
                <tr key={task.id} className="border-b border-border/60">
                  <TD>
                    <form action={updateTaskAction} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={task.id} />
                      <Input name="title" defaultValue={task.title} required className="h-8 text-xs" />
                      <Input name="description" defaultValue={task.description || ""} className="h-8 text-xs" />
                      <input type="hidden" name="project_id" value={task.project_id || ""} />
                      <input type="hidden" name="due_date" value={task.due_date ? task.due_date.slice(0, 16) : ""} />
                      <div className="flex gap-2">
                        <Select name="priority" defaultValue={task.priority} className="h-8 text-xs">
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                          <option value="urgent">urgent</option>
                        </Select>
                        <Select name="status" defaultValue={task.status} className="h-8 text-xs">
                          <option value="todo">todo</option>
                          <option value="in_progress">in_progress</option>
                          <option value="blocked">blocked</option>
                          <option value="done">done</option>
                        </Select>
                        <Button type="submit" variant="secondary" className="h-8 px-2 text-xs">Maj</Button>
                      </div>
                    </form>
                  </TD>
                  <TD>{project?.name || "-"}</TD>
                  <TD>
                    <Badge tone={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}>{task.priority}</Badge>
                  </TD>
                  <TD>{task.status}</TD>
                  <TD>{formatDate(task.due_date)}</TD>
                  <TD>
                    <form action={deleteTaskAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <Button type="submit" variant="ghost" className="text-danger">Supprimer</Button>
                    </form>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}


