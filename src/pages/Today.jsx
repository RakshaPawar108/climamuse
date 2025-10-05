import { useEffect, useMemo, useState } from "react";
import HeroAnswer from "../components/HeroAnswer.jsx";
import ConditionCard from "../components/ConditionCard.jsx";
import ChartCard from "../components/ChartCard.jsx";
import TipsCard from "../components/TipsCard.jsx";
import { useLocation } from "../hooks/useLocation.js";
import { getDataRodsSeries } from "../lib/api/datarods.js";
import { rainRiskFromSeries } from "../lib/scoring.js";

export default function Today() {
  const { coords } = useLocation();
  const [precip, setPrecip] = useState({ rows: [] });
  const [risk, setRisk] = useState("Low");

  useEffect(() => {
    (async () => {
      const now = new Date();
      const start = new Date(now.getTime() - 12 * 60 * 60 * 1000); // last 12h
      const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

      // EXAMPLE default (edit for your region/dataset/variable):
      // Try NLDAS hourly precipitation via Data Rods (if available in your area).
      const dataset = "NLDAS_FORA0125_H_002";
      const variable = "precipitation"; // adjust if your Data Rods catalog uses a different var name

      const data = await getDataRodsSeries({
        dataset,
        variable,
        lat: String(coords.lat),
        lon: String(coords.lon),
        start: fmt(start),
        end: fmt(now),
      });

      setPrecip(data);
      setRisk(rainRiskFromSeries(data.rows));
    })().catch(console.error);
  }, [coords.lat, coords.lon]);

  const badges = useMemo(() => {
    return [`Rain: ${risk}`, `Data: ${precip?.rows?.length || 0} pts`];
  }, [risk, precip]);

  const hero = useMemo(() => {
    if (risk === "High")
      return "Rain is likely in the next hours—plan an indoor option.";
    if (risk === "Moderate")
      return "Some showers possible—have a backup time window.";
    return "Looks fine for outdoor plans in the near term.";
  }, [risk]);

  const updated = `Updated ${new Date().toLocaleTimeString()} • Source: NASA Hydrology Data Rods`;

  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-6 max-w-[1200px] mx-auto">
      <HeroAnswer sentence={hero} badges={badges} timestamp={updated} />

      <div className="col-span-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Rain (12h mean)"
            value={
              Math.round(
                (precip.rows.slice(-3).reduce((s, r) => s + (r.value || 0), 0) /
                  Math.max(1, Math.min(3, precip.rows.length))) *
                  100
              ) / 100
            }
            unit="mm/hr"
            subtitle="Recent 1.5h avg (from last 3 points)"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard title="Rain risk" value={risk} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Points"
            value={precip.rows.length}
            subtitle="Time-series samples"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <ConditionCard
            title="Dataset"
            value="NLDAS"
            subtitle="via Data Rods"
          />
        </div>
      </div>

      <div className="col-span-12 grid md:grid-cols-2 gap-6">
        <ChartCard title="Hourly Precipitation (Data Rods)" />
        <ChartCard title="(Placeholder) Temperature" />
      </div>

      <div className="col-span-12">
        <TipsCard
          text={
            risk === "High"
              ? "If you must run an event, provide covered areas and mats for wet surfaces."
              : "Morning windows are often better—check again closer to your event time."
          }
        />
      </div>
    </div>
  );
}
