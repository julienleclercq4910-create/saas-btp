import { redirect } from "next/navigation";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const [{ data: company }, { data: members }] = await Promise.all([
    ctx.supabase.from("companies").select("name,slug,phone,address,subscription_status").eq("id", ctx.companyId).single(),
    ctx.supabase
      .from("memberships")
      .select("role, user:profiles(full_name,email)")
      .eq("company_id", ctx.companyId)
      .order("created_at", { ascending: true })
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Parametres entreprise</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configuration generale et gestion des utilisateurs.</p>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Entreprise</p>
            <p className="font-medium">{company?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Slug</p>
            <p className="font-medium">{company?.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Telephone</p>
            <p className="font-medium">{company?.phone || "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Adresse</p>
            <p className="font-medium">{company?.address || "-"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Utilisateurs</h2>
        <div className="space-y-2">
          {members?.map((member, i) => {
            const user = one(member.user);
            return (
              <div key={`${user?.email}-${i}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="font-medium">{user?.full_name || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "-"}</p>
                </div>
                <Badge tone={member.role === "admin" ? "warning" : "default"}>{member.role}</Badge>
              </div>
            );
          })}
          {!members?.length ? <p className="text-sm text-muted-foreground">Aucun membre.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Permissions MVP</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>admin entreprise: gerer donnees, utilisateurs, facturation</li>
          <li>membre: consulter et modifier les objets metier</li>
        </ul>
      </Card>
    </div>
  );
}


