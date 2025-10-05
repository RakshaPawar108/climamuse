import { Card } from "./ui/Card.jsx";

export default function HeroAnswer({ sentence, badges = [], timestamp }) {
  return (
    <Card className="col-span-12">
      <p className="text-2xl md:text-3xl font-semibold mb-3">{sentence}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {badges.map((b, i) => (
          <span
            key={i}
            className="text-sm rounded-pill px-3 py-1 border border-slate-300"
          >
            {b}
          </span>
        ))}
      </div>
      {timestamp && <p className="text-xs text-text-muted">{timestamp}</p>}
    </Card>
  );
}
