import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface PatrolSign {
  id: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
}

const ZnakiPatrolowe = () => {
  const [signs, setSigns] = useState<PatrolSign[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("patrol_signs").select("*").order("sort_order").order("name").then(({ data, error }) => {
      if (error) toast.error("Błąd ładowania znaków");
      else setSigns((data ?? []) as PatrolSign[]);
    });
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return signs;
    return signs.filter((z) => z.name.toLowerCase().includes(s) || z.description.toLowerCase().includes(s));
  }, [signs, q]);

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-green))]" />
          <h1 className="text-3xl font-bold">Znaki patrolowe</h1>
        </div>
        <p className="text-sm text-muted-foreground">Galeria znaków z opisem i znaczeniem.</p>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Szukaj znaków…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {signs.length === 0 ? "Brak znaków. Instruktor doda je z panelu admina." : "Brak wyników."}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((z) => (
          <Link
            key={z.id}
            to={`/znaki-patrolowe/${z.id}`}
            className="group border rounded-xl bg-card overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-secondary flex items-center justify-center">
              {z.image_url ? (
                <img src={z.image_url} alt={z.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <span className="text-4xl text-muted-foreground">🏵</span>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium text-sm leading-tight">{z.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ZnakiPatrolowe;
