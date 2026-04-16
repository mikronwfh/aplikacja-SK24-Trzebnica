import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  sort_order: number;
}

const Sprawnosci = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    supabase.from("skills").select("*").order("sort_order").order("name").then(({ data, error }) => {
      if (error) toast.error("Błąd ładowania sprawności");
      else setSkills((data ?? []) as Skill[]);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [skills]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return skills.filter((sk) => {
      const matchQ = !s || sk.name.toLowerCase().includes(s) || sk.description.toLowerCase().includes(s);
      const matchCat = !activeCategory || sk.category === activeCategory;
      return matchQ && matchCat;
    });
  }, [skills, q, activeCategory]);

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-blue))]" />
          <h1 className="text-3xl font-bold">Sprawności</h1>
        </div>
        <p className="text-sm text-muted-foreground">Katalog sprawności — wymagania i odznaki.</p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Szukaj sprawności…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                activeCategory === cat
                  ? "bg-[hsl(var(--sk-blue))] text-[hsl(var(--sk-blue-foreground))] border-transparent"
                  : "hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
          {activeCategory && (
            <button onClick={() => setActiveCategory("")} className="rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {skills.length === 0 ? "Brak sprawności. Instruktor doda je z panelu admina." : "Brak wyników."}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((sk) => (
          <Link
            key={sk.id}
            to={`/sprawnosci/${sk.id}`}
            className="group border rounded-xl bg-card overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-secondary flex items-center justify-center">
              {sk.image_url ? (
                <img src={sk.image_url} alt={sk.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <span className="text-4xl">🏅</span>
              )}
            </div>
            <div className="p-3 space-y-1">
              <div className="font-medium text-sm leading-tight">{sk.name}</div>
              {sk.category && <Badge variant="secondary" className="text-xs">{sk.category}</Badge>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sprawnosci;
