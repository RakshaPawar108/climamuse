export default function Sparkline({
  rows = [],
  width = 560,
  height = 160,
  stroke = "currentColor",
}) {
  const cleaned = rows
    .map((r) => ({ t: r.time, y: Number(r.value) }))
    .filter((p) => Number.isFinite(p.y));

  if (cleaned.length < 2) {
    return (
      <div className="h-40 w-full rounded bg-slate-200/70 grid place-items-center">
        <span className="text-text-muted text-sm">No data</span>
      </div>
    );
  }

  const pad = 8,
    W = width,
    H = height,
    n = cleaned.length;
  const toX = (i) => pad + (n === 1 ? 0 : (i / (n - 1)) * (W - pad * 2));
  const ys = cleaned.map((p) => p.y);
  let minY = Math.min(...ys, 0),
    maxY = Math.max(...ys);
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }
  const toY = (y) => H - pad - ((y - minY) / (maxY - minY)) * (H - pad * 2);

  const d = cleaned
    .map(
      (p, i) => `${i ? "L" : "M"}${toX(i).toFixed(2)},${toY(p.y).toFixed(2)}`
    )
    .join(" ");
  const baselineY = toY(0);
  const area = `${d} L${toX(n - 1).toFixed(2)},${baselineY.toFixed(2)} L${toX(
    0
  ).toFixed(2)},${baselineY.toFixed(2)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <path
        d={area}
        fill="color-mix(in oklab, var(--color-chart-1) 20%, transparent)"
      />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        style={{ color: "var(--color-chart-1)" }}
      />
      <line
        x1={pad}
        x2={W - pad}
        y1={baselineY}
        y2={baselineY}
        stroke="currentColor"
        opacity="0.15"
      />
    </svg>
  );
}
