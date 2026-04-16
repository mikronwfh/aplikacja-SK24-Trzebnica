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
import Songbook from "./pages/Songbook";
import SongView from "./pages/SongView";
import SongFullscreen from "./pages/SongFullscreen";
import Favorites from "./pages/Favorites";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLaw from "./pages/admin/AdminLaw";
import AdminSongs from "./pages/admin/AdminSongs";
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

                <Route path="/spiewnik" element={<RequireAuth><Songbook /></RequireAuth>} />
                <Route path="/spiewnik/:id" element={<RequireAuth><SongView /></RequireAuth>} />
                <Route path="/spiewnik/full/:id" element={<RequireAuth><SongFullscreen /></RequireAuth>} />
                <Route path="/ulubione" element={<RequireAuth><Favorites /></RequireAuth>} />

                <Route path="/admin" element={<RequireInstructor><AdminLayout /></RequireInstructor>}>
                  <Route index element={<Navigate to="uzytkownicy" replace />} />
                  <Route path="uzytkownicy" element={<AdminUsers />} />
                  <Route path="prawo" element={<AdminLaw />} />
                  <Route path="spiewnik" element={<AdminSongs />} />
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
