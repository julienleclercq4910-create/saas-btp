import Link from "next/link";
import { signupAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inscription</h1>
      <p className="mt-1 text-sm text-muted-foreground">Creez votre compte entreprise en moins de 2 minutes.</p>
      {params.error ? <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{params.error}</p> : null}

      <form action={signupAction} className="mt-6 space-y-3">
        <Input name="companyName" placeholder="Nom de l'entreprise" required />
        <Input name="fullName" placeholder="Nom complet" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Mot de passe" required />
        <Button type="submit" className="w-full">
          Creer mon compte
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Deja inscrit ?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}


