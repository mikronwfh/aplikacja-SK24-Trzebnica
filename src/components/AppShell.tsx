import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, Shield, BookOpen, Music2, Star, MoreHorizontal, Shirt, FlameKindling, Award, Gem } from "lucide-react";
import logo from "@/assets/skauci-logo.png";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { user, isInstructor, signOut } = useAuth();
  const loc = useLocation();
  const hideChrome = loc.pathname.startsWith("/spiewnik/full/");

  if (hideChrome) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src={logo} alt="Logo Skautów Króla" className="h-8 w-8" />
            <span className="hidden sm:inline">Skauci Króla</span>
          </Link>
          <nav className="ml-4 hidden md:flex items-center gap-1 text-sm">
            <HeaderLink to="/prawo">Prawo</HeaderLink>
            <HeaderLink to="/symbolika">Symbolika</HeaderLink>
            {user && <HeaderLink to="/mundur">Mundur</HeaderLink>}
            {user && <HeaderLink to="/spiewnik">Śpiewnik</HeaderLink>}
            {user && <HeaderLink to="/znaki-patrolowe">Znaki</HeaderLink>}
            {user && <HeaderLink to="/sprawnosci">Sprawności</HeaderLink>}
            {user && <HeaderLink to="/ulubione">Ulubione</HeaderLink>}
            <HeaderLink to="/rodzice">Strefa Rodzica</HeaderLink>
            <HeaderLink to="/o-nas">O nas</HeaderLink>
            {isInstructor && <HeaderLink to="/admin">Panel</HeaderLink>}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Przełącz motyw" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Konto">
                    <img src={logo} alt="" className="h-6 w-6 rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-xs opacity-70">{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isInstructor && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><Shield className="mr-2 h-4 w-4" />Panel admina</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="default">
                <Link to="/logowanie">Zaloguj</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-8">{children}</main>

      {/* Mobile tab bar — Prawo | Śpiewnik | Symbolika | Mundur | Więcej */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur">
        <ul className="grid grid-cols-5 text-xs">
          <TabItem to="/prawo" icon={<BookOpen className="h-5 w-5" />} label="Prawo" />
          <TabItem to="/spiewnik" icon={<Music2 className="h-5 w-5" />} label="Śpiewnik" />
          <TabItem to="/symbolika" icon={<Gem className="h-5 w-5" />} label="Symbolika" />
          <TabItem to="/mundur" icon={<Shirt className="h-5 w-5" />} label="Mundur" />
          <MoreTab isInstructor={isInstructor} hasUser={!!user} signOut={signOut} />
        </ul>
      </nav>
    </div>
  );
}

function HeaderLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md hover:bg-secondary transition-colors ${isActive ? "bg-secondary font-medium" : ""}`
      }
    >
      {children}
    </NavLink>
  );
}

function TabItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`
        }
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

function MoreTab({ isInstructor, hasUser, signOut }: { isInstructor: boolean; hasUser: boolean; signOut: () => void }) {
  return (
    <li>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" />
            <span>Więcej</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          {hasUser && <DropdownMenuItem asChild><Link to="/znaki-patrolowe"><FlameKindling className="mr-2 h-4 w-4" />Znaki patrolowe</Link></DropdownMenuItem>}
          {hasUser && <DropdownMenuItem asChild><Link to="/sprawnosci"><Award className="mr-2 h-4 w-4" />Sprawności</Link></DropdownMenuItem>}
          {hasUser && <DropdownMenuItem asChild><Link to="/ulubione"><Star className="mr-2 h-4 w-4" />Ulubione</Link></DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/rodzice">Strefa Rodzica</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/o-nas">O nas</Link></DropdownMenuItem>
          {isInstructor && (
            <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Panel admina</Link></DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {hasUser ? (
            <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Wyloguj</DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild><Link to="/logowanie">Zaloguj</Link></DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
