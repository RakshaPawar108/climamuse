export default async function handler(req, res) {
  try {
    const { dataset, variable, lat, lon, start, end } = req.query || {};

    if (!dataset || !variable || !lat || !lon || !start || !end) {
      res.status(400).json({
        error:
          "Missing required params: dataset, variable, lat, lon, start, end",
      });
      return;
    }

    const base =
      "https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi";
    const url = `${base}?dataset=${encodeURIComponent(
      dataset
    )}&variable=${encodeURIComponent(
      variable
    )}&location=lon:${lon};lat:${lat}&startDate=${start}&endDate=${end}&type=asc`;

    const r = await fetch(url, { headers: { Accept: "text/plain" } });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(
        `Data Rods request failed (${r.status}): ${t.slice(0, 240)}`
      );
    }
    const text = await r.text();

    // Parse: skip comment lines starting with '#'
    const lines = text
      .split(/\r?\n/)
      .filter((l) => l.trim() && !l.startsWith("#"));

    // Typical output has two columns: timestamp, value (sometimes more; we keep first 2 tokens)
    const rows = lines.map((l) => {
      const parts = l.trim().split(/[,\s]+/);
      const time = parts[0];
      const val = Number(parts[1]);
      return { time, value: Number.isFinite(val) ? val : null };
    });

    res
      .status(200)
      .json({ dataset, variable, lat: Number(lat), lon: Number(lon), rows });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
