import { notFound, redirect } from "next/navigation";
import { deleteClientAction, updateClientAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const [{ data: client }, { data: projects }, { data: documents }] = await Promise.all([
    ctx.supabase.from("clients").select("*").eq("company_id", ctx.companyId).eq("id", id).single(),
    ctx.supabase.from("projects").select("id,name,status,start_date,end_date").eq("company_id", ctx.companyId).eq("client_id", id).order("created_at", { ascending: false }),
    ctx.supabase.from("documents").select("id,file_name,file_type,created_at").eq("company_id", ctx.companyId).eq("client_id", id).order("created_at", { ascending: false })
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{client.company_name || "Particulier"}</p>
        <p className="mt-4 text-sm">{client.phone || "-"} | {client.email || "-"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{client.address || "Adresse non renseignee"}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Modifier le client</h2>
        <form action={updateClientAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={client.id} />
          <Input name="name" defaultValue={client.name} required />
          <Input name="company_name" defaultValue={client.company_name || ""} />
          <Input name="phone" defaultValue={client.phone || ""} />
          <Input name="email" type="email" defaultValue={client.email || ""} />
          <Input name="address" defaultValue={client.address || ""} className="md:col-span-2" />
          <Textarea name="notes" defaultValue={client.notes || ""} className="md:col-span-2" />
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
        <form action={deleteClientAction} className="mt-2">
          <input type="hidden" name="id" value={client.id} />
          <Button type="submit" variant="secondary" className="text-danger">Supprimer client</Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Chantiers lies</h2>
          <div className="space-y-2">
            {projects?.map((project) => (
              <div key={project.id} className="rounded-lg border border-border px-3 py-2">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.status} - {formatDate(project.start_date)} / {formatDate(project.end_date)}</p>
              </div>
            ))}
            {!projects?.length ? <p className="text-sm text-muted-foreground">Aucun chantier.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-base font-semibold">Documents lies</h2>
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
      </div>
    </div>
  );
}


