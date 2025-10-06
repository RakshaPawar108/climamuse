export default function Sparkline({
  rows = [],
  width = 560,
  height = 160,
  tone = "indigo", // "sky" | "amber" | "indigo"
}) {
  const clean = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (n <= -900) return null; // NASA missing marker
    return n;
  };

  const pts = rows
    .map((r, i) => ({ i, y: clean(r.value) }))
    .filter((p) => p.y !== null);

  const pad = 24,
    W = width,
    H = height;

  if (pts.length === 0) {
    return (
      <div className="h-40 w-full rounded grid place-items-center">
        <span className="text-slate-500 text-sm">No data</span>
      </div>
    );
  }

  const xMin = pts[0].i,
    xMax = pts[pts.length - 1].i;
  const yMin = Math.min(...pts.map((p) => p.y));
  const yMax = Math.max(...pts.map((p) => p.y));
  const sx = (i) =>
    pad + ((i - xMin) * (W - 2 * pad)) / Math.max(1, xMax - xMin);
  const sy = (v) =>
    H - pad - ((v - yMin) * (H - 2 * pad)) / Math.max(1e-6, yMax - yMin);

  const path = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${sx(p.i)},${sy(p.y)}`)
    .join(" ");
  const area = `${path} L${sx(pts[pts.length - 1].i)},${H - pad} L${sx(
    pts[0].i
  )},${H - pad} Z`;

  const line =
    tone === "sky" ? "#0284c7" : tone === "amber" ? "#b45309" : "#4f46e5";

  const fill =
    tone === "sky"
      ? "rgba(14, 165, 233, 0.15)"
      : tone === "amber"
      ? "rgba(245, 158, 11, 0.15)"
      : "rgba(99, 102, 241, 0.12)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <rect x="0" y="0" width={W} height={H} fill="transparent" />
      {pts.length >= 2 ? <path d={area} fill={fill} /> : null}
      {pts.length >= 2 ? (
        <path d={path} fill="none" stroke={line} strokeWidth="2" />
      ) : (
        <circle cx={sx(pts[0].i)} cy={sy(pts[0].y)} r="3" fill={line} />
      )}
    </svg>
  );
}
