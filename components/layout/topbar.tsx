import { signOut } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function Topbar({ companyName }: { companyName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Entreprise</p>
        <p className="text-lg font-semibold">{companyName}</p>
      </div>
      <form action={signOut}>
        <Button variant="secondary" type="submit">
          Deconnexion
        </Button>
      </form>
    </header>
  );
}


