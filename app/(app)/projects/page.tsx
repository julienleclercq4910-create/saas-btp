import Link from "next/link";
import { redirect } from "next/navigation";
import { createProjectAction, deleteProjectAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const [{ data: projects }, { data: clients }] = await Promise.all([
    ctx.supabase
      .from("projects")
      .select("id,name,status,progress,planned_budget,actual_cost,start_date,end_date,client:clients(name)")
      .eq("company_id", ctx.companyId)
      .order("created_at", { ascending: false }),
    ctx.supabase.from("clients").select("id,name").eq("company_id", ctx.companyId).order("name")
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chantiers</h1>
        <p className="text-sm text-muted-foreground">Suivi complet des projets: budget, avancement, documents, mesures et taches.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Nouveau chantier</h2>
        <form action={createProjectAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input name="name" placeholder="Nom du chantier" required />
          <Select name="client_id">
            <option value="">Client (optionnel)</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <Input name="address" placeholder="Adresse" />
          <Select name="status" defaultValue="quote">
            <option value="quote">devis</option>
            <option value="in_progress">en cours</option>
            <option value="done">termine</option>
            <option value="on_hold">en attente</option>
          </Select>
          <Input name="start_date" type="date" />
          <Input name="end_date" type="date" />
          <Input name="planned_budget" type="number" placeholder="Budget prevu" required />
          <Input name="actual_cost" type="number" placeholder="Cout reel" defaultValue="0" required />
          <Input name="progress" type="number" placeholder="Avancement %" defaultValue="0" required />
          <Input name="description" placeholder="Description" className="md:col-span-2" />
          <Input name="notes" placeholder="Notes" className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit">Ajouter le chantier</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border">
              <TH>Nom</TH>
              <TH>Client</TH>
              <TH>Statut</TH>
              <TH>Avancement</TH>
              <TH>Budget</TH>
              <TH>Dates</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => {
              const client = one(project.client);
              return (
                <tr key={project.id} className="border-b border-border/60">
                  <TD>
                    <Link href={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                      {project.name}
                    </Link>
                  </TD>
                  <TD>{client?.name || "-"}</TD>
                  <TD>
                    <Badge tone={project.status === "done" ? "success" : project.status === "in_progress" ? "warning" : "default"}>{project.status}</Badge>
                  </TD>
                  <TD>{project.progress}%</TD>
                  <TD>
                    {formatCurrency(Number(project.actual_cost || 0))} / {formatCurrency(Number(project.planned_budget || 0))}
                  </TD>
                  <TD>
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                  </TD>
                  <TD>
                    <form action={deleteProjectAction}>
                      <input type="hidden" name="id" value={project.id} />
                      <Button type="submit" variant="ghost" className="text-danger">
                        Supprimer
                      </Button>
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


