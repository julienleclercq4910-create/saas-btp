import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectListCard({ projects }: { projects: Array<{ id: string; name: string; status: string; progress: number }> }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Derniers chantiers</h3>
        <Link href="/projects" className="text-sm text-primary underline-offset-2 hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.progress}% d'avancement</p>
            </div>
            <Badge tone={project.status === "done" ? "success" : project.status === "in_progress" ? "warning" : "default"}>
              {project.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}


