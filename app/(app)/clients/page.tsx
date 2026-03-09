import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientAction, deleteClientAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TD, TH } from "@/components/ui/table";

export default async function ClientsPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const { data: clients } = await ctx.supabase
    .from("clients")
    .select("id,name,company_name,phone,email,address,created_at")
    .eq("company_id", ctx.companyId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">Centralisez vos contacts et leur historique chantier.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Nouveau client</h2>
        <form action={createClientAction} className="grid gap-3 md:grid-cols-2">
          <Input name="name" placeholder="Nom" required />
          <Input name="company_name" placeholder="Societe" />
          <Input name="phone" placeholder="Telephone" />
          <Input name="email" placeholder="Email" type="email" />
          <Input name="address" placeholder="Adresse" className="md:col-span-2" />
          <Textarea name="notes" placeholder="Remarques" className="md:col-span-2" />
          <div className="md:col-span-2">
            <Button type="submit">Ajouter le client</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border">
              <TH>Nom</TH>
              <TH>Societe</TH>
              <TH>Contact</TH>
              <TH>Adresse</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b border-border/60">
                <TD>
                  <Link href={`/clients/${client.id}`} className="font-medium text-primary hover:underline">
                    {client.name}
                  </Link>
                </TD>
                <TD>{client.company_name || "-"}</TD>
                <TD>
                  {client.phone || "-"}
                  <br />
                  <span className="text-xs text-muted-foreground">{client.email || "-"}</span>
                </TD>
                <TD>{client.address || "-"}</TD>
                <TD>
                  <form action={deleteClientAction}>
                    <input type="hidden" name="id" value={client.id} />
                    <Button type="submit" variant="ghost" className="text-danger">Supprimer</Button>
                  </form>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}


