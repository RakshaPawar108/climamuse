import { useEffect, useState } from "react";

// Default: Chicago if permission blocked
export function useLocation(defaultLat = 41.8781, defaultLon = -87.6298) {
  const [coords, setCoords] = useState({ lat: defaultLat, lon: defaultLon });
  const [status, setStatus] = useState("idle"); // 'idle' | 'ok' | 'blocked'

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("blocked");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("ok");
      },
      () => setStatus("blocked"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return { coords, status };
}
