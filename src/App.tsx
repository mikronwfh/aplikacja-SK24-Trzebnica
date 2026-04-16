import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import AppShell from "@/components/AppShell";
import { RequireAuth, RequireInstructor } from "@/components/Guards";
import Index from "./pages/Index";
import About from "./pages/About";
import Parents from "./pages/Parents";
import Login from "./pages/Login";
import Law from "./pages/Law";
import Symbolika from "./pages/Symbolika";
import Mundur from "./pages/Mundur";
import Songbook from "./pages/Songbook";
import SongView from "./pages/SongView";
import SongFullscreen from "./pages/SongFullscreen";
import ZnakiPatrolowe from "./pages/ZnakiPatrolowe";
import ZnakDetail from "./pages/ZnakDetail";
import Sprawnosci from "./pages/Sprawnosci";
import SprawnosdDetail from "./pages/SprawnosdDetail";
import Favorites from "./pages/Favorites";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLaw from "./pages/admin/AdminLaw";
import AdminSongs from "./pages/admin/AdminSongs";
import AdminSymbolika from "./pages/admin/AdminSymbolika";
import AdminMundur from "./pages/admin/AdminMundur";
import AdminZnaki from "./pages/admin/AdminZnaki";
import AdminSprawnosci from "./pages/admin/AdminSprawnosci";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppShell>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/o-nas" element={<About />} />
                <Route path="/rodzice" element={<Parents />} />
                <Route path="/logowanie" element={<Login />} />
                <Route path="/prawo" element={<Law />} />
                <Route path="/symbolika" element={<Symbolika />} />

                <Route path="/mundur" element={<RequireAuth><Mundur /></RequireAuth>} />
                <Route path="/spiewnik" element={<RequireAuth><Songbook /></RequireAuth>} />
                <Route path="/spiewnik/:id" element={<RequireAuth><SongView /></RequireAuth>} />
                <Route path="/spiewnik/full/:id" element={<RequireAuth><SongFullscreen /></RequireAuth>} />
                <Route path="/znaki-patrolowe" element={<RequireAuth><ZnakiPatrolowe /></RequireAuth>} />
                <Route path="/znaki-patrolowe/:id" element={<RequireAuth><ZnakDetail /></RequireAuth>} />
                <Route path="/sprawnosci" element={<RequireAuth><Sprawnosci /></RequireAuth>} />
                <Route path="/sprawnosci/:id" element={<RequireAuth><SprawnosdDetail /></RequireAuth>} />
                <Route path="/ulubione" element={<RequireAuth><Favorites /></RequireAuth>} />

                <Route path="/admin" element={<RequireInstructor><AdminLayout /></RequireInstructor>}>
                  <Route index element={<Navigate to="uzytkownicy" replace />} />
                  <Route path="uzytkownicy" element={<AdminUsers />} />
                  <Route path="prawo" element={<AdminLaw />} />
                  <Route path="spiewnik" element={<AdminSongs />} />
                  <Route path="symbolika" element={<AdminSymbolika />} />
                  <Route path="mundur" element={<AdminMundur />} />
                  <Route path="znaki" element={<AdminZnaki />} />
                  <Route path="sprawnosci" element={<AdminSprawnosci />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
