import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation as useGeo } from "../hooks/useLocation.js";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // Get browser geolocation once as a good default
  const { coords: geo } = useGeo(); // { lat, lon }
  const [coords, setCoords] = useState(geo || { lat: 41.8781, lon: -87.6298 }); // Chicago fallback
  const [units, setUnits] = useState("C"); // "C" | "F"

  // When geolocation resolves later, adopt it once
  useEffect(() => {
    if (geo?.lat && geo?.lon) setCoords(geo);
  }, [geo?.lat, geo?.lon]);

  const value = useMemo(
    () => ({ coords, setCoords, units, setUnits }),
    [coords, units]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
