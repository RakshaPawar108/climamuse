import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "power-proxy",
      configureServer(server) {
        // Health check
        server.middlewares.use("/api/ping", (_req, res) => {
          res.setHeader("Content-Type", "text/plain");
          res.end("pong");
        });

        // POWER hourly proxy
        server.middlewares.use("/api/power", async (req, res) => {
          try {
            const u = new URL(req.url, "http://local");
            const lat = u.searchParams.get("lat") || "41.8781";
            const lon = u.searchParams.get("lon") || "-87.6298";
            const start = u.searchParams.get("start"); // YYYYMMDD
            const end = u.searchParams.get("end"); // YYYYMMDD
            const params =
              u.searchParams.get("params") || "T2M,PRECTOTCORR,WS2M,RH2M";

            if (!start || !end) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({ error: "Missing start/end (YYYYMMDD)" })
              );
              return;
            }

            const base =
              "https://power.larc.nasa.gov/api/temporal/hourly/point";
            const qs = new URLSearchParams({
              parameters: params,
              latitude: lat,
              longitude: lon,
              start,
              end,
              community: "RE",
              format: "JSON",
              // time-standard left default (UTC)
            }).toString();

            const remote = `${base}?${qs}`;
            const r = await fetch(remote);
            const data = await r.json();
            if (!r.ok) {
              res.statusCode = r.status;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: data?.message || "POWER error",
                  remote,
                })
              );
              return;
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ remote, ...data }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      },
    },
  ],
});
