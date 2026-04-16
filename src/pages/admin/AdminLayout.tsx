import { NavLink, Outlet } from "react-router-dom";
import { Users, BookOpen, Music2, Gem, Shirt, FlameKindling, Award } from "lucide-react";

const AdminLayout = () => {
  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-red))]" />
        <h1 className="text-2xl font-bold">Panel admina</h1>
      </div>
      <nav className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        <Tab to="/admin/uzytkownicy" icon={<Users className="h-4 w-4" />}>Konta</Tab>
        <Tab to="/admin/prawo" icon={<BookOpen className="h-4 w-4" />}>Prawo</Tab>
        <Tab to="/admin/spiewnik" icon={<Music2 className="h-4 w-4" />}>Śpiewnik</Tab>
        <Tab to="/admin/symbolika" icon={<Gem className="h-4 w-4" />}>Symbolika</Tab>
        <Tab to="/admin/mundur" icon={<Shirt className="h-4 w-4" />}>Mundur</Tab>
        <Tab to="/admin/znaki" icon={<FlameKindling className="h-4 w-4" />}>Znaki</Tab>
        <Tab to="/admin/sprawnosci" icon={<Award className="h-4 w-4" />}>Sprawności</Tab>
      </nav>
      <Outlet />
    </div>
  );
};

function Tab({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive ? "bg-[hsl(var(--sk-red))] text-[hsl(var(--sk-red-foreground))]" : "hover:bg-secondary"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

export default AdminLayout;
