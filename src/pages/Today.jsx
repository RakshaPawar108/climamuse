import { useEffect, useMemo, useState } from "react";
import HeroAnswer from "../components/HeroAnswer.jsx";
import ConditionCard from "../components/ConditionCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import TipsCard from "../components/TipsCard.jsx";
import { useLocation } from "../hooks/useLocation.js";

/* -------------------- helpers: cleaning + language -------------------- */

// POWER uses -999 as "missing"
const clean = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n <= -900 ? null : n;
};

function rainRiskFromAvgMmPerHr(avg) {
  if (avg == null) return "Unknown";
  if (avg >= 1.5) return "High";
  if (avg >= 0.3) return "Moderate";
  return "Low";
}
function heatLevelFromTempC(t) {
  if (t == null) return "—";
  if (t >= 37) return "Extreme heat";
  if (t >= 32) return "Very hot";
  if (t >= 27) return "Warm";
  if (t >= 18) return "Mild";
  if (t >= 10) return "Cool";
  return "Cold";
}
function windLabel(ms) {
  if (ms == null) return "—";
  if (ms >= 14) return "Strong wind";
  if (ms >= 8) return "Breezy";
  if (ms >= 4) return "Light wind";
  return "Calm";
}
function makeHero({ rainRisk, tempC, windMs }) {
  const heat = heatLevelFromTempC(tempC);
  const wind = windLabel(windMs);
  if (rainRisk === "High")
    return "Rain likely in the next few hours — plan for cover or pick an indoor slot.";
  if (rainRisk === "Moderate")
    return "Spotty showers possible — keep plans flexible and check an hour before.";
  if (heat === "Very hot" || heat === "Extreme heat")
    return "Low rain risk — but it’ll be hot. Hydrate and favor shade.";
  if (wind === "Strong wind")
    return "Low rain risk — strong winds though; secure light items.";
  return "Low rain risk — good window for outdoor plans.";
}
function makeBadges({ rainRisk, hoursCount, latestTemp, latestWind }) {
  const parts = [`Rain: ${rainRisk}`];
  if (hoursCount) parts.push(`${hoursCount}h data`);
  if (latestTemp != null) parts.push(`${Math.round(latestTemp)}°C now`);
  if (latestWind != null) parts.push(`${Math.round(latestWind)} m/s wind`);
  return parts;
}
function makeTip({ rainRisk, tempC, windMs }) {
  if (rainRisk === "High")
    return "Provide covered areas, non-slip mats, and send a rain alert 30 minutes before.";
  if (rainRisk === "Moderate")
    return "Pick a flexible time window and set a nearby indoor fallback.";
  const heat = heatLevelFromTempC(tempC);
  if (heat === "Very hot" || heat === "Extreme heat")
    return "Shift to morning/evening, carry water, and plan shade breaks.";
  if (windLabel(windMs) === "Strong wind")
    return "Avoid tall signage; secure lightweight objects and tents.";
  return "Looks good — recheck an hour before in case conditions shift.";
}

/* -------------------- NASA POWER fetch + shape -------------------- */

const DropIcon = (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
);
const ThermIcon = (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M10 5a2 2 0 1 1 4 0v7a5 5 0 1 1-4 0V5z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="17" r="2" fill="currentColor" />
  </svg>
);
const WindIcon = (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M3 8h11a3 3 0 1 0-3-3M3 12h14a3 3 0 1 1-3 3M3 16h7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

function yyyymmdd(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

async function fetchPowerHourly({ lat, lon, start, end }) {
  const base = "https://power.larc.nasa.gov/api/temporal/hourly/point";
  const qs = new URLSearchParams({
    parameters: "T2M,PRECTOTCORR,WS2M",
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

function flatten(powerJson) {
  const p = powerJson?.properties?.parameter || {};
  const dates = Object.keys(p.T2M || {}).sort();
  const out = { temp: [], precip: [], wind: [] };
  for (const d of dates) {
    const T = Array.isArray(p.T2M?.[d]) ? p.T2M[d] : [];
    const R = Array.isArray(p.PRECTOTCORR?.[d]) ? p.PRECTOTCORR[d] : [];
    const W = Array.isArray(p.WS2M?.[d]) ? p.WS2M[d] : [];
    const n = Math.max(T.length, R.length, W.length);
    for (let h = 0; h < n; h++) {
      const when = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${String(
        h
      ).padStart(2, "0")}:00:00Z`;
      const tV = clean(T[h]);
      const rV = clean(R[h]);
      const wV = clean(W[h]);
      if (tV !== null) out.temp.push({ time: when, value: tV });
      if (rV !== null) out.precip.push({ time: when, value: rV });
      if (wV !== null) out.wind.push({ time: when, value: wV });
    }
  }
  return out;
}

/* -------------------- Component -------------------- */

export default function Today() {
  const { coords } = useLocation();
  const [temp, setTemp] = useState([]);
  const [precip, setPrecip] = useState([]);
  const [wind, setWind] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        // Last 48h → avoids “empty today” edge cases for some coords/timezones
        const now = new Date();
        const start = yyyymmdd(new Date(now.getTime() - 48 * 3600 * 1000));
        const end = yyyymmdd(now);
        const json = await fetchPowerHourly({
          lat: coords.lat,
          lon: coords.lon,
          start,
          end,
        });
        const { temp, precip, wind } = flatten(json);
        setTemp(temp);
        setPrecip(precip);
        setWind(wind);
      } catch (e) {
        setErr(e.message || String(e));
      }
    })();
  }, [coords.lat, coords.lon]);

  const latest = (rows) =>
    rows.length ? Number(rows[rows.length - 1].value) : null;
  const rainAvg3h = useMemo(() => {
    const last3 = precip.slice(-3).map((p) => Number(p.value) || 0);
    return last3.length
      ? Math.round((last3.reduce((a, b) => a + b, 0) / last3.length) * 100) /
          100
      : 0;
  }, [precip]);

  const rainRisk = rainRiskFromAvgMmPerHr(rainAvg3h);
  const latestTemp = latest(temp);
  const latestWind = latest(wind);
  const hero = makeHero({ rainRisk, tempC: latestTemp, windMs: latestWind });
  const badges = makeBadges({
    rainRisk,
    hoursCount: Math.max(temp.length, precip.length, wind.length),
    latestTemp,
    latestWind,
  });
  const tip = makeTip({ rainRisk, tempC: latestTemp, windMs: latestWind });
  const updated = `Updated ${new Date().toLocaleTimeString()} • NASA POWER`;

  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-6 max-w-[1200px] mx-auto">
      <HeroAnswer sentence={hero} badges={badges} timestamp={updated} />

      {err && (
        <div className="col-span-12 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Rain (1.5h avg)"
            value={rainAvg3h}
            unit="mm/hr"
            subtitle="Mean of last 3 hrs"
            icon={DropIcon}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Temp (latest)"
            value={latestTemp != null ? Math.round(latestTemp) : "—"}
            unit="°C"
            subtitle="Closest recent hour"
            icon={ThermIcon}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Wind (latest)"
            value={latestWind != null ? Math.round(latestWind) : "—"}
            unit="m/s"
            subtitle="Closest recent hour"
            icon={WindIcon}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Rain risk"
            value={rainRisk}
            subtitle={
              rainRisk === "High" ? "Carry an umbrella" : "Monitor sky cover"
            }
            icon={DropIcon}
          />
        </div>
      </div>

      <div className="col-span-12 grid md:grid-cols-2 gap-6">
        <ChartCard
          title="Hourly Temperature"
          rows={temp}
          icon={ThermIcon}
          tone="amber"
        />
        <ChartCard
          title="Hourly Precipitation"
          rows={precip}
          icon={DropIcon}
          tone="sky"
        />
      </div>

      <div className="col-span-12">
        <TipsCard text={tip} />
      </div>
    </div>
  );
}
