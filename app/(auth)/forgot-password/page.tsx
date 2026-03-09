import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mot de passe oublie</h1>
      <p className="mt-1 text-sm text-muted-foreground">Nous envoyons un lien de reinitialisation.</p>
      {params.error ? <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{params.error}</p> : null}
      {params.message ? <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{params.message}</p> : null}

      <form action={forgotPasswordAction} className="mt-6 space-y-3">
        <Input name="email" type="email" placeholder="Email" required />
        <Button type="submit" className="w-full">
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}


