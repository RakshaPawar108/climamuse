// Tiny heuristic using precipitation time series (mm/hr or kg m-2 s-1 depending on dataset).
// You can refine thresholds based on the dataset's units. Here, treat >0.2 as "wet".
export function rainRiskFromSeries(rows) {
  if (!rows?.length) return "Low";
  const last3 = rows.slice(-3);
  const mean = last3.reduce((s, r) => s + (r.value || 0), 0) / last3.length;
  if (mean >= 0.2) return "High";
  if (rows.slice(-6).some((r) => (r.value || 0) >= 0.1)) return "Moderate";
  return "Low";
}
