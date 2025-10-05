import { Card } from "./ui/Card.jsx";
export default function TipsCard({ text }) {
  return (
    <Card>
      <p className="text-sm">{text}</p>
    </Card>
  );
}
