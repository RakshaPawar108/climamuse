import { Card } from "./ui/Card.jsx";

export default function HeroAnswer({ sentence, badges = [], timestamp }) {
  return (
    <Card className="col-span-12 ring-1 ring-slate-200 bg-gradient-to-r from-sky-50 to-amber-50">
      <p className="text-2xl md:text-3xl font-semibold mb-3 text-slate-900">
        {sentence}
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        {badges.map((b, i) => (
          <span
            key={i}
            className={`text-sm rounded-full px-3 py-1 border ${
              i % 2 === 0
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {b}
          </span>
        ))}
      </div>

      {timestamp && <p className="text-xs text-slate-600">{timestamp}</p>}
    </Card>
  );
}
