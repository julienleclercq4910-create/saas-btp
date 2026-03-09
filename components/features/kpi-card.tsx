import { Card } from "@/components/ui/card";

export function KpiCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </Card>
  );
}


