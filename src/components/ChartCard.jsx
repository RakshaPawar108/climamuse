import { Card, CardHeader } from "./ui/Card.jsx";
import Sparkline from "./Sparkline.jsx";

export default function ChartCard({ title, rows = [] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="rounded bg-white/50 border border-border">
        <Sparkline rows={rows} />{" "}
      </div>
      <div className="mt-2 text-xs text-text-muted">
        Source: NASA POWER (hourly)
      </div>
    </Card>
  );
}
