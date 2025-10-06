export async function getPowerHourly({
  lat,
  lon,
  start,
  end,
  params = ["T2M", "PRECTOTCORR", "WS2M", "RH2M"],
}) {
  const s = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    start,
    end,
    params: params.join(","),
  });
  const r = await fetch(`/api/power?${s.toString()}`);
  if (!r.ok) throw new Error(`POWER ${r.status}`);
  const data = await r.json();
  return data;
}
