import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext.jsx";

export default function ControlsBar() {
  const { units, setUnits, coords, setCoords } = useSettings();
  const [lat, setLat] = useState(coords.lat.toFixed(4));
  const [lon, setLon] = useState(coords.lon.toFixed(4));

  // keep inputs in sync with external changes
  useEffect(() => {
    setLat(coords.lat.toFixed(4));
    setLon(coords.lon.toFixed(4));
  }, [coords.lat, coords.lon]);

  const presets = [
    { label: "My location", lat: coords.lat, lon: coords.lon },
    { label: "Seattle, USA", lat: 47.6062, lon: -122.3321 },
    { label: "Mumbai, India", lat: 19.076, lon: 72.8777 },
    { label: "Singapore", lat: 1.3521, lon: 103.8198 },
    { label: "London, UK", lat: 51.5072, lon: -0.1276 },
  ];

  const applyManual = () => {
    const la = Number(lat),
      lo = Number(lon);
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      setCoords({ lat: la, lon: lo });
    }
  };

  return (
    <div className="col-span-12 flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur p-3 rounded-xl border border-slate-200">
      <select
        className="px-3 py-2 rounded-md border border-slate-300"
        value={`${coords.lat},${coords.lon}`}
        onChange={(e) => {
          const [pla, plo] = e.target.value.split(",").map(Number);
          if (Number.isFinite(pla) && Number.isFinite(plo)) {
            setCoords({ lat: pla, lon: plo });
          }
        }}
      >
        {presets.map((p) => (
          <option key={p.label} value={`${p.lat},${p.lon}`}>
            {p.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-600">Lat</label>
        <input
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="w-28 px-3 py-2 rounded-md border border-slate-300"
        />
        <label className="text-xs text-slate-600">Lon</label>
        <input
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          className="w-28 px-3 py-2 rounded-md border border-slate-300"
        />
        <button
          onClick={applyManual}
          className="px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
        >
          Apply
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-slate-600">Units</span>
        <div className="inline-flex rounded-md overflow-hidden border border-slate-300">
          <button
            className={`px-3 py-2 text-sm ${
              units === "C" ? "bg-primary-600 text-white" : "bg-white"
            }`}
            onClick={() => setUnits("C")}
          >
            °C
          </button>
          <button
            className={`px-3 py-2 text-sm ${
              units === "F" ? "bg-primary-600 text-white" : "bg-white"
            }`}
            onClick={() => setUnits("F")}
          >
            °F
          </button>
        </div>
      </div>
    </div>
  );
}
