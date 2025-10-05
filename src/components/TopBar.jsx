import { NavLink } from "react-router-dom";

export default function TopBar() {
  const link = "px-3 py-2 rounded-md text-sm font-medium";
  const active = ({ isActive }) =>
    isActive
      ? `${link} bg-white shadow-sm`
      : `${link} text-text-secondary hover:bg-white/70`;
  return (
    <header className="w-full h-16 bg-bgcanvas sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="font-bold">ClimaMuse</div>
      <nav className="flex gap-2">
        <NavLink to="/" className={active}>
          Today
        </NavLink>
        <NavLink to="/week" className={active}>
          Week
        </NavLink>
        <NavLink to="/plan" className={active}>
          Plan
        </NavLink>
      </nav>
      <div className="flex items-center gap-3 text-text-secondary">
        <span className="hidden md:inline text-sm">NASA • GES DISC</span>
        <div className="h-8 w-8 rounded-full bg-slate-300" />
      </div>
    </header>
  );
}
