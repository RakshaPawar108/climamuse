import { useEffect, useMemo, useState } from "react";
import HeroAnswer from "../components/HeroAnswer.jsx";
import ConditionCard from "../components/ConditionCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import TipsCard from "../components/TipsCard.jsx";
import { useLocation } from "../hooks/useLocation.js";

/** POWER hourly fetch (direct; CORS is allowed) */
async function fetchPowerHourly({
  lat,
  lon,
  startYYYYMMDD,
  endYYYYMMDD,
  params = ["T2M", "PRECTOTCORR", "WS2M", "RH2M"],
}) {
  const base = "https://power.larc.nasa.gov/api/temporal/hourly/point";
  const qs = new URLSearchParams({
    parameters: params.join(","),
    latitude: String(lat),
    longitude: String(lon),
    start: startYYYYMMDD,
    end: endYYYYMMDD,
    community: "RE",
    format: "JSON",
  }).toString();
  const r = await fetch(`${base}?${qs}`);
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

/** Simple rain risk from recent hours (explainable heuristic) */
function computeRainRisk(precipRows) {
  // use last 3 hours mean (mm/hr) → Low / Moderate / High
  const last = precipRows.slice(-3).map((d) => Number(d.value) || 0);
  if (last.length === 0) return "Low";
  const mean = last.reduce((a, b) => a + b, 0) / last.length;
  if (mean >= 1.5) return "High";
  if (mean >= 0.3) return "Moderate";
  return "Low";
}

/** Flatten POWER hourly structure → array of {time, value} */
function flattenPowerHourly(powerJson) {
  const p = powerJson?.properties?.parameter || {};
  const dates = Object.keys(p.T2M || {}).sort(); // YYYYMMDD
  const toISO = (d, h) =>
    `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${String(h).padStart(
      2,
      "0"
    )}:00:00Z`;

  const tempRows = [];
  const precipRows = [];
  const windRows = [];
  const rhRows = [];

  for (const d of dates) {
    const tArr = Array.isArray(p.T2M?.[d]) ? p.T2M[d] : [];
    const rArr = Array.isArray(p.PRECTOTCORR?.[d]) ? p.PRECTOTCORR[d] : [];
    const wArr = Array.isArray(p.WS2M?.[d]) ? p.WS2M[d] : [];
    const hArr = Array.isArray(p.RH2M?.[d]) ? p.RH2M[d] : [];
    const n = Math.max(tArr.length, rArr.length, wArr.length, hArr.length);
    for (let h = 0; h < n; h++) {
      const stamp = toISO(d, h);
      const tVal = Number(tArr[h]);
      if (Number.isFinite(tVal)) tempRows.push({ time: stamp, value: tVal });
      const rVal = Number(rArr[h]);
      if (Number.isFinite(rVal)) precipRows.push({ time: stamp, value: rVal });
      const wVal = Number(wArr[h]);
      if (Number.isFinite(wVal)) windRows.push({ time: stamp, value: wVal });
      const hVal = Number(hArr[h]);
      if (Number.isFinite(hVal)) rhRows.push({ time: stamp, value: hVal });
    }
  }
  return { tempRows, precipRows, windRows, rhRows };
}

export default function Today() {
  const { coords } = useLocation();
  const [temp, setTemp] = useState({ rows: [] });
  const [precip, setPrecip] = useState({ rows: [] });
  const [wind, setWind] = useState({ rows: [] });
  const [rh, setRh] = useState({ rows: [] });
  const [risk, setRisk] = useState("Low");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const now = new Date();
        const end = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
        const startDate = new Date(now.getTime() - 24 * 3600 * 1000);
        const start = startDate.toISOString().slice(0, 10).replace(/-/g, ""); // last 24h

        const data = await fetchPowerHourly({
          lat: coords.lat,
          lon: coords.lon,
          startYYYYMMDD: start,
          endYYYYMMDD: end,
          params: ["T2M", "PRECTOTCORR", "WS2M", "RH2M"],
        });

        const { tempRows, precipRows, windRows, rhRows } =
          flattenPowerHourly(data);
        setTemp({ rows: tempRows });
        setPrecip({ rows: precipRows });
        setWind({ rows: windRows });
        setRh({ rows: rhRows });
        setRisk(computeRainRisk(precipRows));
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [coords.lat, coords.lon]);

  const badges = useMemo(
    () => [
      `Rain: ${risk}`,
      `Hours: ${Math.max(temp.rows.length, precip.rows.length)}`,
    ],
    [risk, temp.rows.length, precip.rows.length]
  );

  const hero = useMemo(() => {
    if (risk === "High")
      return "Rain likely in the next few hours — shift your plan indoors or delay.";
    if (risk === "Moderate")
      return "Some showers possible — pick a flexible window or nearby shelter.";
    return "Good to go for outdoor plans in the near term — keep water and shade handy.";
  }, [risk]);

  const updated = `Updated ${new Date().toLocaleTimeString()} • Source: NASA POWER (hourly)`;

  // handy helpers for cards
  const last3hMeanRain =
    Math.round(
      (precip.rows.slice(-3).reduce((s, r) => s + (Number(r.value) || 0), 0) /
        Math.max(1, Math.min(3, precip.rows.length))) *
        100
    ) / 100;

  const latest = (rows) => (rows.length ? rows[rows.length - 1].value : null);

  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-6 max-w-[1200px] mx-auto">
      <HeroAnswer sentence={hero} badges={badges} timestamp={updated} />

      {err && (
        <div className="col-span-12 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {loading && (
        <div className="col-span-12 text-sm text-text-secondary">
          Loading NASA POWER…
        </div>
      )}

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Rain (1.5h avg)"
            value={last3hMeanRain}
            unit="mm/hr"
            subtitle="Mean of last 3 hours"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard title="Rain risk" value={risk} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Temp (latest)"
            value={
              latest(temp.rows) != null ? Math.round(latest(temp.rows)) : "—"
            }
            unit="°C"
            subtitle="Closest recent hour"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Wind (latest)"
            value={
              latest(wind.rows) != null ? Math.round(latest(wind.rows)) : "—"
            }
            unit="m/s"
            subtitle="Closest recent hour"
          />
        </div>
      </div>

      {/* Keep your existing chart cards as placeholders to avoid SVG NaN errors. 
          If you later wire a sparkline, pass sanitized rows to it. */}
      <div className="col-span-12 grid md:grid-cols-2 gap-6">
        <ChartCard title="Hourly Temperature (NASA POWER)" />
        <ChartCard title="Hourly Precipitation (NASA POWER)" />
      </div>

      <div className="col-span-12">
        <TipsCard
          text={
            risk === "High"
              ? "If you must run the event, provide covered areas and non-slip mats."
              : "Aim for earlier or later hours to avoid heat/UV; recheck 1 hr before."
          }
        />
      </div>
    </div>
  );
}
