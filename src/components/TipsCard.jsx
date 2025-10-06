import { Card } from "./ui/Card.jsx";
export default function TipsCard({ text }) {
  return (
    <Card className="border-l-4 border-amber-400 card-tint-amber">
      <p className="text-sm text-amber-900">{text}</p>
    </Card>
  );
}
