import { notFound, redirect } from "next/navigation";
import { deleteMeasurementAction, updateMeasurementAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

const categories = [
  "escalier_demi_quart_tournant",
  "escalier_limon_central",
  "garde_corps_terrasse",
  "dressing",
  "meuble_salle_de_bain"
];

export default async function MeasurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const { data: measurement } = await ctx.supabase
    .from("measurements")
    .select("*, project:projects(name,address)")
    .eq("company_id", ctx.companyId)
    .eq("id", id)
    .single();

  const { data: projects } = await ctx.supabase.from("projects").select("id,name").eq("company_id", ctx.companyId).order("name");

  if (!measurement) notFound();

  const dims = (measurement.dimensions || {}) as { width_mm?: number; height_mm?: number; depth_mm?: number };

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-semibold">{measurement.work_type}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{measurement.category}</p>
        <p className="mt-2 text-sm">Chantier: {measurement.project?.name || "-"}</p>
        <p className="text-sm text-muted-foreground">Date de mesure: {formatDate(measurement.measured_at)}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Modifier la prise de mesure</h2>
        <form action={updateMeasurementAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="id" value={measurement.id} />
          <Select name="project_id" defaultValue={measurement.project_id} required>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </Select>
          <Select name="category" defaultValue={measurement.category}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          <Input name="work_type" defaultValue={measurement.work_type} required />
          <Input name="measured_at" type="date" defaultValue={measurement.measured_at} required />
          <Input name="width_mm" type="number" defaultValue={String(dims.width_mm || "")} required />
          <Input name="height_mm" type="number" defaultValue={String(dims.height_mm || "")} required />
          <Input name="depth_mm" type="number" defaultValue={String(dims.depth_mm || "")} required />
          <Textarea name="notes" defaultValue={measurement.notes || ""} className="md:col-span-2" />
          <Textarea name="sketch_notes" defaultValue={measurement.sketch_notes || ""} className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4 flex gap-2">
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
        <form action={deleteMeasurementAction} className="mt-2">
          <input type="hidden" name="id" value={measurement.id} />
          <Button type="submit" variant="secondary" className="text-danger">Supprimer prise de mesure</Button>
        </form>
      </Card>
    </div>
  );
}


