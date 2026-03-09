import { notFound, redirect } from "next/navigation";
import { deleteProjectAction, updateProjectAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const [{ data: project }, { data: tasks }, { data: documents }, { data: measurements }, { data: clients }] = await Promise.all([
    ctx.supabase.from("projects").select("*, client:clients(name, phone, email)").eq("company_id", ctx.companyId).eq("id", id).single(),
    ctx.supabase.from("tasks").select("id,title,status,priority,due_date").eq("company_id", ctx.companyId).eq("project_id", id).order("created_at", { ascending: false }),
    ctx.supabase.from("documents").select("id,file_name,file_type,created_at").eq("company_id", ctx.companyId).eq("project_id", id).order("created_at", { ascending: false }),
    ctx.supabase.from("measurements").select("id,category,measured_at,work_type,dimensions").eq("company_id", ctx.companyId).eq("project_id", id).order("measured_at", { ascending: false }),
    ctx.supabase.from("clients").select("id,name").eq("company_id", ctx.companyId).order("name")
  ]);

  if (!project) notFound();
  const client = one(project.client);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.address || "Adresse non renseignee"}</p>
          </div>
          <Badge tone={project.status === "done" ? "success" : project.status === "in_progress" ? "warning" : "default"}>{project.status}</Badge>
        </div>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Client</p>
            <p className="font-medium">{client?.name || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium">{formatCurrency(Number(project.actual_cost || 0))} / {formatCurrency(Number(project.planned_budget || 0))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Periode</p>
            <p className="font-medium">{formatDate(project.start_date)} - {formatDate(project.end_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avancement</p>
            <p className="font-medium">{project.progress}%</p>
          </div>
        </div>
      </header>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Modifier le chantier</h2>
        <form action={updateProjectAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="id" value={project.id} />
          <Input name="name" defaultValue={project.name} required />
          <Select name="client_id" defaultValue={project.client_id || ""}>
            <option value="">Client (optionnel)</option>
            {clients?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input name="address" defaultValue={project.address || ""} />
          <Select name="status" defaultValue={project.status}>
            <option value="quote">devis</option>
            <option value="in_progress">en cours</option>
            <option value="done">termine</option>
            <option value="on_hold">en attente</option>
          </Select>
          <Input name="start_date" type="date" defaultValue={project.start_date || ""} />
          <Input name="end_date" type="date" defaultValue={project.end_date || ""} />
          <Input name="planned_budget" type="number" defaultValue={String(project.planned_budget ?? 0)} required />
          <Input name="actual_cost" type="number" defaultValue={String(project.actual_cost ?? 0)} required />
          <Input name="progress" type="number" defaultValue={String(project.progress ?? 0)} required />
          <Input name="description" defaultValue={project.description || ""} className="md:col-span-2" />
          <Textarea name="notes" defaultValue={project.notes || ""} className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
        <form action={deleteProjectAction} className="mt-2">
          <input type="hidden" name="id" value={project.id} />
          <Button type="submit" variant="secondary" className="text-danger">Supprimer chantier</Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Taches liees</h2>
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div key={task.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.status} - {task.priority} - {task.due_date ? formatDate(task.due_date) : "sans echeance"}
                </p>
              </div>
            ))}
            {!tasks?.length ? <p className="text-sm text-muted-foreground">Aucune tache liee.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold">Documents</h2>
          <div className="space-y-2">
            {documents?.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">{doc.file_type} - {formatDate(doc.created_at)}</p>
              </div>
            ))}
            {!documents?.length ? <p className="text-sm text-muted-foreground">Aucun document.</p> : null}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Prises de mesures</h2>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {measurements?.map((m) => (
              <div key={m.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium">{m.work_type}</p>
                <p className="text-xs text-muted-foreground">{m.category} - {formatDate(m.measured_at)}</p>
                <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(m.dimensions, null, 2)}</pre>
              </div>
            ))}
            {!measurements?.length ? <p className="text-sm text-muted-foreground">Aucune mesure enregistree.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}


