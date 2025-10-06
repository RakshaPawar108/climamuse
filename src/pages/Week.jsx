import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { useLocation } from "../hooks/useLocation.js";

/** Fetch NASA POWER daily data for T2M (°C) and PRECTOTCORR (mm/day) */
async function fetchPowerDaily({ lat, lon, startYYYYMMDD, endYYYYMMDD }) {
  const base = "https://power.larc.nasa.gov/api/temporal/daily/point";
  const params = new URLSearchParams({
    parameters: "T2M,PRECTOTCORR",
    latitude: String(lat),
    longitude: String(lon),
    start: startYYYYMMDD,
    end: endYYYYMMDD,
    community: "RE",
    format: "JSON",
  }).toString();

  const r = await fetch(`${base}?${params}`);
  if (!r.ok) {
    let msg = `POWER error ${r.status}`;
    try {
      const j = await r.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
  return r.json();
}

/** Helper: last N days as YYYYMMDD range [start,end] inclusive */
function lastNDaysRange(n = 7, now = new Date()) {
  const end = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const s = new Date(now.getTime() - (n - 1) * 24 * 3600 * 1000);
  const start = s.toISOString().slice(0, 10).replace(/-/g, "");
  return { start, end };
}

/** Score a day: lower is better — prioritize dryness, then thermal comfort (24°C target) */
function dayScore({ rain, temp }) {
  const rainWeight = 1000; // any rain dominates; tweak as needed
  const tempPenalty = Math.abs((temp ?? 24) - 24); // distance from comfy 24°C
  return (rain ?? 0) * rainWeight + tempPenalty;
}

export default function Week() {
  const { coords } = useLocation();
  const [days, setDays] = useState([]); // [{key:"YYYYMMDD", temp, rain, label}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { start, end } = lastNDaysRange(7, new Date());
        const data = await fetchPowerDaily({
          lat: coords.lat,
          lon: coords.lon,
          startYYYYMMDD: start,
          endYYYYMMDD: end,
        });

        const p = data?.properties?.parameter || {};
        const t = p.T2M || {};
        const r = p.PRECTOTCORR || {};
        const keys = Object.keys(t)
          .concat(Object.keys(r))
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort(); // YYYYMMDD ascending

        const fmtLabel = (yyyymmdd) => {
          const y = yyyymmdd.slice(0, 4),
            m = yyyymmdd.slice(4, 6),
            d = yyyymmdd.slice(6, 8);
          const dt = new Date(`${y}-${m}-${d}T00:00:00Z`);
          return dt.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue...
        };

        const rows = keys.map((k) => {
          const temp = Number(t[k]);
          const rain = Number(r[k]);
          return {
            key: k,
            temp: Number.isFinite(temp) ? temp : null,
            rain: Number.isFinite(rain) ? rain : 0,
            label: fmtLabel(k),
          };
        });

        setDays(rows);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [coords.lat, coords.lon]);

  const best = useMemo(() => {
    if (!days.length) return null;
    // Choose lowest rain; break ties by temperature closeness to 24°C
    const sorted = [...days].sort((a, b) => dayScore(a) - dayScore(b));
    return sorted[0];
  }, [days]);

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto grid gap-6">
      <h2 className="text-2xl font-semibold text-text-primary">
        7-Day (NASA POWER)
      </h2>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {loading && (
        <div className="text-sm text-text-secondary">Loading NASA POWER…</div>
      )}

      {best && (
        <Card>
          <div className="flex flex-wrap items-baseline gap-3">
            <div className="text-lg font-semibold">
              Best day for outdoor plans:
            </div>
            <div className="text-lg">
              {best.label} ({best.key.slice(4, 6)}/{best.key.slice(6, 8)})
            </div>
            <div className="text-sm text-text-muted">
              {best.rain?.toFixed(1)} mm rain · {Math.round(best.temp)}°C
            </div>
          </div>
        </Card>
      )}

      {/* Weekly strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {days.map((d) => {
          const isBest = best && d.key === best.key;
          return (
            <Card
              key={d.key}
              className={`p-4 ${isBest ? "ring-2 ring-primary-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-text-secondary">{d.label}</p>
                <span className="text-xs text-text-muted">
                  {d.key.slice(4, 6)}/{d.key.slice(6, 8)}
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold">
                {d.temp != null ? Math.round(d.temp) : "—"}°C
              </p>
              <p className="text-sm text-text-muted">
                {(d.rain ?? 0).toFixed(1)} mm
              </p>
            </Card>
          );
        })}
      </div>

      {/* Simple anomalies chips (optional): highlights hotter/colder than 24°C */}
      {days.length > 0 && (
        <Card>
          <div className="flex flex-wrap gap-2 text-sm">
            {days.map((d) => {
              if (d.temp == null) return null;
              const delta = Math.round(d.temp - 24);
              if (Math.abs(delta) < 3) return null; // ignore near-normal
              return (
                <span
                  key={`anom-${d.key}`}
                  className={`px-3 py-1 rounded-full border ${
                    delta > 0
                      ? "border-orange-300 bg-orange-50"
                      : "border-sky-300 bg-sky-50"
                  }`}
                >
                  {d.label}:{" "}
                  {delta > 0 ? `+${delta}°C warmer` : `${delta}°C cooler`}
                </span>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
