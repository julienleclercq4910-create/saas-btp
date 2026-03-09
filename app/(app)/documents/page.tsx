import { redirect } from "next/navigation";
import { createDocumentAction, deleteDocumentAction, updateDocumentAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TD, TH } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const query = ctx.supabase
    .from("documents")
    .select("id,file_name,file_type,file_path,tags,created_at,client:clients(name),project:projects(name)")
    .eq("company_id", ctx.companyId)
    .order("created_at", { ascending: false });

  if (params.type) query.ilike("file_type", `${params.type}%`);

  const [{ data: documents }, { data: clients }, { data: projects }] = await Promise.all([
    query,
    ctx.supabase.from("clients").select("id,name").eq("company_id", ctx.companyId),
    ctx.supabase.from("projects").select("id,name").eq("company_id", ctx.companyId)
  ]);

  const urls = await Promise.all(
    (documents || []).map(async (doc) => {
      const signed = await ctx.supabase.storage.from("documents").createSignedUrl(doc.file_path, 60 * 10);
      return { id: doc.id, url: signed.data?.signedUrl || null };
    })
  );

  const urlMap = new Map(urls.map((u) => [u.id, u.url]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">Upload, tri et consultation rapide des fichiers chantier/client.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Uploader un document</h2>
        <form action={createDocumentAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input name="file" type="file" required />
          <Select name="project_id">
            <option value="">Chantier (optionnel)</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select name="client_id">
            <option value="">Client (optionnel)</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <div>
            <Button type="submit">Uploader</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <a href="/documents" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">Tous</a>
          <a href="/documents?type=image" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">Images</a>
          <a href="/documents?type=application/pdf" className="rounded-lg border border-border px-3 py-1.5 hover:bg-slate-50">PDF</a>
        </div>
        <Table>
          <thead>
            <tr className="border-b border-border">
              <TH>Fichier</TH>
              <TH>Type</TH>
              <TH>Client</TH>
              <TH>Chantier</TH>
              <TH>Date</TH>
              <TH>Apercu</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {documents?.map((doc) => {
              const client = one(doc.client);
              const project = one(doc.project);

              return (
                <tr key={doc.id} className="border-b border-border/60">
                  <TD>
                    <form action={updateDocumentAction} className="space-y-1">
                      <input type="hidden" name="id" value={doc.id} />
                      <Input name="file_name" defaultValue={doc.file_name} className="h-8 text-xs" />
                      <Input name="tags" defaultValue={(doc.tags || []).join(", ")} className="h-8 text-xs" placeholder="tags separes par ," />
                      <Button type="submit" variant="secondary" className="h-8 px-2 text-xs">Maj</Button>
                    </form>
                  </TD>
                  <TD>{doc.file_type}</TD>
                  <TD>{client?.name || "-"}</TD>
                  <TD>{project?.name || "-"}</TD>
                  <TD>{formatDate(doc.created_at)}</TD>
                  <TD>
                    {urlMap.get(doc.id) ? (
                      <a href={urlMap.get(doc.id)!} target="_blank" className="text-primary hover:underline">
                        Ouvrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </TD>
                  <TD>
                    <form action={deleteDocumentAction}>
                      <input type="hidden" name="id" value={doc.id} />
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


