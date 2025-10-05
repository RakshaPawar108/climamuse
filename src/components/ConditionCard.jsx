import { Card, CardHeader } from "./ui/Card.jsx";

export default function ConditionCard({ title, value, unit, subtitle }) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader title={title} />
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-bold">{value ?? "—"}</div>
        {unit && <div className="text-text-muted">{unit}</div>}
      </div>
      {subtitle && (
        <div className="text-sm text-text-secondary">{subtitle}</div>
      )}
      <div className="mt-2 h-8 w-full rounded bg-slate-200/60" />
    </Card>
  );
}
