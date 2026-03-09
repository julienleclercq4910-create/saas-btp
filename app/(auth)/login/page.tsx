import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted-foreground">Accedez a votre espace entreprise.</p>
      {params.error ? <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{params.error}</p> : null}
      {params.message ? <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{params.message}</p> : null}

      <form action={loginAction} className="mt-6 space-y-3">
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Mot de passe" required />
        <Button type="submit" className="w-full">
          Se connecter
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Mot de passe oublie
        </Link>
        <Link href="/signup" className="text-primary hover:underline">
          Creer un compte
        </Link>
      </div>
    </div>
  );
}


