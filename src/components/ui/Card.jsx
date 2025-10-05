export function Card({ children, className = "" }) {
  return (
    <div className={`bg-bgcard rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}
export function CardHeader({ title, icon }) {
  return (
    <div className="flex items-center gap-3 mb-3 text-text-secondary">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}
