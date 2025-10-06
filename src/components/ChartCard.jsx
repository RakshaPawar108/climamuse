import { Card, CardHeader } from "./ui/Card.jsx";
import Sparkline from "./Sparkline.jsx";

/** tone: "sky" (rain), "amber" (heat), default "indigo" */
export default function ChartCard({ title, rows = [], icon, tone = "indigo" }) {
  return (
    <Card>
      <CardHeader title={title} icon={icon} />
      <div
        className={`rounded border ${
          tone === "sky"
            ? "bg-sky-50 border-sky-200"
            : tone === "amber"
            ? "bg-amber-50 border-amber-200"
            : "bg-white/70 border-slate-200"
        }`}
      >
        <Sparkline rows={rows} tone={tone} />
      </div>
      <div className="mt-2 text-xs text-text-muted">
        Source: NASA POWER (hourly)
      </div>
    </Card>
  );
}
