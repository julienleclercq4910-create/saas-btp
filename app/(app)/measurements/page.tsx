import Link from "next/link";
import { redirect } from "next/navigation";
import { createMeasurementAction, deleteMeasurementAction } from "@/lib/actions";
import { getCompanyScopedData } from "@/lib/queries";
import { one } from "@/lib/relations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TD, TH } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const categories = [
  "escalier_demi_quart_tournant",
  "escalier_limon_central",
  "garde_corps_terrasse",
  "dressing",
  "meuble_salle_de_bain"
];

export default async function MeasurementsPage() {
  const ctx = await getCompanyScopedData();
  if (!ctx) redirect("/login");

  const [{ data: measurements }, { data: projects }] = await Promise.all([
    ctx.supabase
      .from("measurements")
      .select("id,work_type,category,measured_at,project:projects(name),dimensions")
      .eq("company_id", ctx.companyId)
      .order("measured_at", { ascending: false }),
    ctx.supabase.from("projects").select("id,name").eq("company_id", ctx.companyId).order("name")
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Prises de mesures</h1>
        <p className="text-sm text-muted-foreground">Outil terrain pour cotes, observations et croquis texte.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Nouvelle prise de mesure</h2>
        <form action={createMeasurementAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select name="project_id" required>
            <option value="">Selectionner un chantier</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={categories[0]}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input name="work_type" placeholder="Type d'ouvrage" required />
          <Input name="measured_at" type="date" required />
          <Input name="width_mm" type="number" placeholder="Largeur (mm)" required />
          <Input name="height_mm" type="number" placeholder="Hauteur (mm)" required />
          <Input name="depth_mm" type="number" placeholder="Profondeur (mm)" required />
          <Textarea name="notes" placeholder="Observations / prise de cotes" className="md:col-span-2" />
          <Textarea name="sketch_notes" placeholder="Croquis / remarques terrain" className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border">
              <TH>Ouvrage</TH>
              <TH>Categorie</TH>
              <TH>Chantier</TH>
              <TH>Date</TH>
              <TH>Dimensions</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {measurements?.map((measurement) => {
              const project = one(measurement.project);
              return (
                <tr key={measurement.id} className="border-b border-border/60">
                  <TD>
                    <Link href={`/measurements/${measurement.id}`} className="font-medium text-primary hover:underline">
                      {measurement.work_type}
                    </Link>
                  </TD>
                  <TD>{measurement.category}</TD>
                  <TD>{project?.name || "-"}</TD>
                  <TD>{formatDate(measurement.measured_at)}</TD>
                  <TD className="text-xs">
                    <pre className="overflow-auto rounded bg-slate-50 p-2">{JSON.stringify(measurement.dimensions, null, 2)}</pre>
                  </TD>
                  <TD>
                    <form action={deleteMeasurementAction}>
                      <input type="hidden" name="id" value={measurement.id} />
                      <Button type="submit" variant="ghost" className="text-danger">Supprimer</Button>
                    </form>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}


