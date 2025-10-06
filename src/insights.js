// src/insights.js

// Treat POWER missing as null
export const clean = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n <= -900 ? null : n;
};

// Simple buckets you can tune
export function rainRiskFromAvgMmPerHr(avg) {
  if (avg == null) return "Unknown";
  if (avg >= 1.5) return "High";
  if (avg >= 0.3) return "Moderate";
  return "Low";
}

export function heatLevelFromTempC(t) {
  if (t == null) return "—";
  if (t >= 37) return "Extreme heat";
  if (t >= 32) return "Very hot";
  if (t >= 27) return "Warm";
  if (t >= 18) return "Mild";
  if (t >= 10) return "Cool";
  return "Cold";
}

export function windLabel(ms) {
  if (ms == null) return "—";
  if (ms >= 14) return "Strong wind";
  if (ms >= 8) return "Breezy";
  if (ms >= 4) return "Light wind";
  return "Calm";
}

// Build a plain-language headline (hero)
export function makeHero({ rainRisk, tempC, windMs }) {
  const heat = heatLevelFromTempC(tempC);
  const wind = windLabel(windMs);

  if (rainRisk === "High") {
    return "Rain likely in the next few hours — plan for cover or pick an indoor slot.";
  }
  if (rainRisk === "Moderate") {
    return "Spotty showers possible — keep plans flexible and check an hour before.";
  }
  // Low or Unknown: mix in heat/wind context
  if (heat === "Very hot" || heat === "Extreme heat") {
    return "Low rain risk — but it’ll be hot. Hydrate and favor shade.";
  }
  if (wind === "Strong wind") {
    return "Low rain risk — strong winds though, secure light items.";
  }
  return "Low rain risk — good window for outdoor plans.";
}

// Compact chips under the hero
export function makeBadges({ rainRisk, hoursCount, latestTemp, latestWind }) {
  const parts = [];
  parts.push(`Rain: ${rainRisk}`);
  if (hoursCount) parts.push(`${hoursCount}h data`);
  if (latestTemp != null) parts.push(`${Math.round(latestTemp)}°C now`);
  if (latestWind != null) parts.push(`${Math.round(latestWind)} m/s wind`);
  return parts;
}

// Contextual tip
export function makeTip({ rainRisk, tempC, windMs }) {
  if (rainRisk === "High") {
    return "Provide covered areas, non-slip mats, and send a rain alert 30 minutes before.";
  }
  if (rainRisk === "Moderate") {
    return "Pick a flexible time window and set a nearby indoor fallback.";
  }
  const heat = heatLevelFromTempC(tempC);
  if (heat === "Very hot" || heat === "Extreme heat") {
    return "Shift to morning/evening, carry water, and add shade breaks.";
  }
  const wind = windLabel(windMs);
  if (wind === "Strong wind") {
    return "Avoid tall signage; secure lightweight objects and tents.";
  }
  return "Looks good — recheck an hour before in case conditions shift.";
}

// Week summary sentence (optional)
export function summarizeWeek(days) {
  const valid = days.filter((d) => d.temp != null);
  if (!valid.length) return "No week summary available.";
  const avgT = valid.reduce((s, d) => s + d.temp, 0) / valid.length;
  const wetDays = days.filter((d) => (d.rain ?? 0) >= 5).length;
  return `Avg ~${Math.round(avgT)}°C, ${wetDays} wet day${
    wetDays === 1 ? "" : "s"
  } expected.`;
}
