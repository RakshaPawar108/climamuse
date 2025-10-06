import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

function UmbrellaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 12v6a3 3 0 1 0 6 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const clean = (v, def = null) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return n <= -900 ? def : n;
};
const toF = (c) => (c == null ? null : (c * 9) / 5 + 32);
function yyyymmdd(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
function lastNDaysRange(n = 7, now = new Date()) {
  const end = yyyymmdd(now);
  const s = new Date(now.getTime() - (n - 1) * 24 * 3600 * 1000);
  const start = yyyymmdd(s);
  return { start, end };
}
function score({ rain, tempC }) {
  const rainPenalty = (rain ?? 0) * 1000;
  const tempPenalty = Math.abs((tempC ?? 24) - 24); // score in °C space
  return rainPenalty + tempPenalty;
}

async function fetchPowerDaily({ lat, lon, start, end }) {
  const base = "https://power.larc.nasa.gov/api/temporal/daily/point";
  const qs = new URLSearchParams({
    parameters: "T2M,PRECTOTCORR",
    latitude: String(lat),
    longitude: String(lon),
    start,
    end,
    community: "RE",
    format: "JSON",
  }).toString();
  const r = await fetch(`${base}?${qs}`);
  if (!r.ok) throw new Error(`POWER ${r.status}`);
  return r.json();
}

export default function Week() {
  const { coords, units } = useSettings();
  const [days, setDays] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const { start, end } = lastNDaysRange(7, new Date());
        const j = await fetchPowerDaily({
          lat: coords.lat,
          lon: coords.lon,
          start,
          end,
        });
        const p = j?.properties?.parameter || {};
        const t = p.T2M || {};
        const r = p.PRECTOTCORR || {};
        const keys = Array.from(
          new Set([...Object.keys(t), ...Object.keys(r)])
        ).sort();

        const toLabel = (k) => {
          const dt = new Date(
            `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}T00:00:00Z`
          );
          return dt.toLocaleDateString(undefined, { weekday: "short" });
        };

        const rows = keys.map((k) => {
          const tempC = clean(t[k]);
          const rain = clean(r[k], 0);
          return {
            key: k,
            tempC,
            tempShow:
              units === "F"
                ? tempC != null
                  ? Math.round(toF(tempC))
                  : null
                : tempC != null
                ? Math.round(tempC)
                : null,
            rain,
            label: toLabel(k),
            md: `${k.slice(4, 6)}/${k.slice(6, 8)}`,
          };
        });

        setDays(rows);
      } catch (e) {
        setErr(e.message || String(e));
      }
    })();
  }, [coords.lat, coords.lon, units]); // refetch when units change so “Best day” description stays consistent

  const best = useMemo(() => {
    const have = days.filter((d) => d.tempC != null);
    if (!have.length) return null;
    return [...have].sort((a, b) => score(a) - score(b))[0];
  }, [days]);

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto grid gap-6">
      <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
        <UmbrellaIcon /> 7-Day (NASA POWER)
      </h2>

      {best && (
        <Card className="card-tint-sky">
          <div className="flex flex-wrap items-baseline gap-3">
            <div className="text-lg font-semibold">
              Best day for outdoor plans:
            </div>
            <div className="text-lg">
              {best.label} ({best.md})
            </div>
            <div className="text-sm text-slate-600">
              {(best.rain ?? 0).toFixed(1)} mm rain ·{" "}
              {best.tempShow != null ? best.tempShow : "—"}°{units}
            </div>
          </div>
        </Card>
      )}

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {days.map((d) => {
          const isBest = best && d.key === best.key;
          const hotC = d.tempC != null && d.tempC >= 30;
          const wet = (d.rain ?? 0) >= 5;
          const tone = wet
            ? "card-tint-sky"
            : hotC
            ? "card-tint-amber"
            : "bg-white/80 border border-slate-200";
          return (
            <Card
              key={d.key}
              className={`p-4 ${tone} ${
                isBest ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-600">{d.label}</p>
                <span className="text-xs text-slate-500">{d.md}</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">
                {d.tempShow != null ? d.tempShow : "—"}°{units}
              </p>
              <p className="text-sm text-slate-500">
                {(d.rain ?? 0).toFixed(1)} mm
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
