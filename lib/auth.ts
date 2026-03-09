import { createClient } from "@/lib/supabase-server";
import { one } from "@/lib/relations";

export async function getCurrentUserContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, company:companies(id, name, slug, subscription_status)")
    .eq("user_id", user.id)
    .single();

  if (!membership) return null;

  return {
    user,
    membership: {
      ...membership,
      company: one(membership.company)
    }
  };
}


