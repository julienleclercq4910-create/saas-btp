import { redirect } from "next/navigation";
import { getCompanyScopedData } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function BillingPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const { data: subscription } = await ctx.supabase
    .from("subscriptions")
    .select("plan,status,current_period_end,stripe_customer_id")
    .eq("company_id", ctx.companyId)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Abonnement</h1>
        <p className="mt-1 text-sm text-muted-foreground">Facturation mensuelle et evolution future des plans.</p>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Plan</p>
            <p className="font-medium">{subscription?.plan || "starter"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Statut</p>
            <Badge tone={subscription?.status === "active" ? "success" : "warning"}>{subscription?.status || "trial"}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Prochaine echeance</p>
            <p className="font-medium">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR") : "-"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stripe customer</p>
            <p className="font-medium">{subscription?.stripe_customer_id || "non configure"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-semibold">Passer a un plan payant</h2>
        <form action="/api/stripe/checkout" method="post">
          <Button type="submit">Ouvrir Stripe Checkout</Button>
        </form>
      </Card>
    </div>
  );
}


