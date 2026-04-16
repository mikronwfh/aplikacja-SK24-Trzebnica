import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-muted-foreground">Ładowanie…</div>;
  if (!user) return <Navigate to="/logowanie" replace />;
  return <>{children}</>;
}

export function RequireInstructor({ children }: { children: ReactNode }) {
  const { user, isInstructor, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-muted-foreground">Ładowanie…</div>;
  if (!user) return <Navigate to="/logowanie" replace />;
  if (!isInstructor) return <Navigate to="/" replace />;
  return <>{children}</>;
}
