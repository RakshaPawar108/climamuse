import { Card, CardHeader } from "./ui/Card.jsx";
export default function ChartCard({ title }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="h-40 w-full rounded bg-slate-200/70 grid place-items-center">
        <span className="text-text-muted text-sm">Chart placeholder</span>
      </div>
      <div className="mt-2 text-xs text-text-muted">
        Source: NASA Hydrology Data Rods
      </div>
    </Card>
  );
}
