export async function getDataRodsSeries({
  dataset,
  variable,
  lat,
  lon,
  start,
  end,
}) {
  const qs = new URLSearchParams({
    dataset,
    variable,
    lat,
    lon,
    start,
    end,
  }).toString();
  const r = await fetch(`/api/datarods?${qs}`);
  if (!r.ok) throw new Error(`Data Rods proxy failed: ${r.status}`);
  return r.json(); // { dataset, variable, rows: [{time, value}, ...] }
}
