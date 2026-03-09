"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { clientSchema, measurementSchema, projectSchema, taskSchema } from "@/lib/schemas";

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non connecté");

  const { data } = await supabase.from("memberships").select("company_id").eq("user_id", user.id).single();
  if (!data) throw new Error("Entreprise introuvable");

  return { companyId: data.company_id, userId: user.id, supabase };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createClientAction(formData: FormData) {
  const parsed = clientSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase.from("clients").insert({
    company_id: companyId,
    ...parsed,
    email: parsed.email || null
  });

  revalidatePath("/clients");
}

export async function updateClientAction(formData: FormData) {
  const id = String(formData.get("id"));
  const parsed = clientSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase
    .from("clients")
    .update({ ...parsed, email: parsed.email || null })
    .eq("id", id)
    .eq("company_id", companyId);

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { companyId, supabase } = await getContext();

  await supabase.from("clients").delete().eq("id", id).eq("company_id", companyId);

  revalidatePath("/clients");
  redirect("/clients");
}

export async function createProjectAction(formData: FormData) {
  const parsed = projectSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase.from("projects").insert({
    company_id: companyId,
    ...parsed,
    client_id: parsed.client_id || null,
    start_date: parsed.start_date || null,
    end_date: parsed.end_date || null
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProjectAction(formData: FormData) {
  const id = String(formData.get("id"));
  const parsed = projectSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase
    .from("projects")
    .update({
      ...parsed,
      client_id: parsed.client_id || null,
      start_date: parsed.start_date || null,
      end_date: parsed.end_date || null
    })
    .eq("id", id)
    .eq("company_id", companyId);

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProjectAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { companyId, supabase } = await getContext();

  await supabase.from("projects").delete().eq("id", id).eq("company_id", companyId);

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects");
}

export async function createTaskAction(formData: FormData) {
  const parsed = taskSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase.from("tasks").insert({
    company_id: companyId,
    ...parsed,
    project_id: parsed.project_id || null,
    due_date: parsed.due_date || null
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTaskAction(formData: FormData) {
  const id = String(formData.get("id"));
  const parsed = taskSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase
    .from("tasks")
    .update({
      ...parsed,
      project_id: parsed.project_id || null,
      due_date: parsed.due_date || null
    })
    .eq("id", id)
    .eq("company_id", companyId);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { companyId, supabase } = await getContext();

  await supabase.from("tasks").delete().eq("id", id).eq("company_id", companyId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createMeasurementAction(formData: FormData) {
  const parsed = measurementSchema.parse(Object.fromEntries(formData));
  const { companyId, userId, supabase } = await getContext();

  await supabase.from("measurements").insert({
    company_id: companyId,
    project_id: parsed.project_id,
    category: parsed.category,
    work_type: parsed.work_type,
    measured_at: parsed.measured_at,
    dimensions: {
      width_mm: parsed.width_mm,
      height_mm: parsed.height_mm,
      depth_mm: parsed.depth_mm
    },
    notes: parsed.notes || null,
    sketch_notes: parsed.sketch_notes || null,
    created_by: userId
  });

  revalidatePath("/measurements");
}

export async function updateMeasurementAction(formData: FormData) {
  const id = String(formData.get("id"));
  const parsed = measurementSchema.parse(Object.fromEntries(formData));
  const { companyId, supabase } = await getContext();

  await supabase
    .from("measurements")
    .update({
      project_id: parsed.project_id,
      category: parsed.category,
      work_type: parsed.work_type,
      measured_at: parsed.measured_at,
      dimensions: {
        width_mm: parsed.width_mm,
        height_mm: parsed.height_mm,
        depth_mm: parsed.depth_mm
      },
      notes: parsed.notes || null,
      sketch_notes: parsed.sketch_notes || null
    })
    .eq("id", id)
    .eq("company_id", companyId);

  revalidatePath("/measurements");
  revalidatePath(`/measurements/${id}`);
}

export async function deleteMeasurementAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { companyId, supabase } = await getContext();

  await supabase.from("measurements").delete().eq("id", id).eq("company_id", companyId);
  revalidatePath("/measurements");
  redirect("/measurements");
}

export async function createDocumentAction(formData: FormData) {
  const { companyId, userId, supabase } = await getContext();
  const file = formData.get("file") as File | null;
  const projectId = (formData.get("project_id") as string) || null;
  const clientId = (formData.get("client_id") as string) || null;

  if (!file || file.size === 0) throw new Error("Fichier manquant");

  const path = `${companyId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (uploadError) throw uploadError;

  await supabase.from("documents").insert({
    company_id: companyId,
    project_id: projectId,
    client_id: clientId,
    uploaded_by: userId,
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_path: path,
    tags: []
  });

  revalidatePath("/documents");
}

export async function updateDocumentAction(formData: FormData) {
  const id = String(formData.get("id"));
  const fileName = String(formData.get("file_name") || "").trim();
  const tagsRaw = String(formData.get("tags") || "");
  const { companyId, supabase } = await getContext();

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await supabase
    .from("documents")
    .update({ file_name: fileName || "document", tags })
    .eq("id", id)
    .eq("company_id", companyId);

  revalidatePath("/documents");
}

export async function deleteDocumentAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { companyId, supabase } = await getContext();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (doc?.file_path) {
    await supabase.storage.from("documents").remove([doc.file_path]);
  }

  await supabase.from("documents").delete().eq("id", id).eq("company_id", companyId);
  revalidatePath("/documents");
}


