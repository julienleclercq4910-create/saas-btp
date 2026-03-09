"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { adminClient } from "@/lib/supabase-admin";
import { loginSchema, signupSchema } from "@/lib/schemas";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 42);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      data: {
        full_name: parsed.fullName
      }
    }
  });

  if (error || !data.user) {
    redirect(`/signup?error=${encodeURIComponent(error?.message || "Erreur inscription")}`);
  }

  const companyInsert = await adminClient
    .from("companies")
    .insert({
      name: parsed.companyName,
      slug: `${slugify(parsed.companyName)}-${Date.now().toString().slice(-4)}`,
      subscription_status: "trial"
    })
    .select("id")
    .single();

  if (companyInsert.error || !companyInsert.data) {
    redirect(`/signup?error=${encodeURIComponent("Impossible de creer l entreprise")}`);
  }

  await adminClient.from("profiles").upsert({
    id: data.user.id,
    full_name: parsed.fullName,
    email: parsed.email
  });

  await adminClient.from("memberships").insert({
    user_id: data.user.id,
    company_id: companyInsert.data.id,
    role: "admin"
  });

  redirect("/login?message=Compte cree. Connectez-vous.");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login`
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?message=Email envoye");
}


