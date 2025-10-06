export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/80 backdrop-blur rounded-2xl shadow-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, icon, subtitle }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="inline-flex h-5 w-5 text-slate-600">{icon}</span>
        )}
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
