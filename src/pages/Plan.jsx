import Button from "../components/ui/Button.jsx";

export default function Plan() {
  return (
    <div className="grid grid-cols-12 gap-6 px-6 py-6 max-w-[1200px] mx-auto">
      <div className="col-span-12 md:col-span-6 rounded-lg bg-bgcard shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Plan an Event</h3>
        <div className="grid gap-3">
          <input
            className="border rounded-md px-3 h-10"
            placeholder="Event name"
          />
          <input
            className="border rounded-md px-3 h-10"
            placeholder="Date range (YYYY-MM-DD to YYYY-MM-DD)"
          />
          <input
            className="border rounded-md px-3 h-10"
            placeholder="Time window (e.g., 14:00–18:00)"
          />
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Outdoor
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Indoor
            </label>
          </div>
          <Button>Get my window</Button>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 rounded-lg bg-bgcard shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">Best 2-hr window</h3>
        <p className="text-sm text-text-secondary">
          Sat 4–6 PM (Low rain risk)
        </p>
        <div className="mt-3 text-xs text-text-muted">
          Source: NASA Hydrology Data Rods (time series near your location).
        </div>
      </div>
    </div>
  );
}
