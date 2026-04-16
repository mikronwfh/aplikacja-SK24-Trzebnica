import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/favorites";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Search } from "lucide-react";
import { toast } from "sonner";

export interface Song {
  id: string;
  title: string;
  body: string;
  categories: string[];
}

export const SONG_CATEGORIES = ["ognisko", "pielgrzymka", "liturgia", "patrolowe"] as const;

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[hsl(var(--sk-yellow))] text-[hsl(var(--sk-yellow-foreground))] rounded px-0.5">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

const Songbook = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("songs").select("id,title,body,categories").order("title").then(({ data, error }) => {
      if (error) toast.error("Błąd ładowania śpiewnika");
      else setSongs((data ?? []) as Song[]);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    listFavorites(user.id).then((rows) => {
      setFavs(new Set(rows.filter((r) => r.item_type === "song").map((r) => r.item_id)));
    });
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return songs.filter((song) => {
      if (cats.size > 0 && !song.categories.some((c) => cats.has(c))) return false;
      if (!s) return true;
      return song.title.toLowerCase().includes(s) || song.body.toLowerCase().includes(s);
    });
  }, [songs, q, cats]);

  const toggleCat = (c: string) => {
    const n = new Set(cats);
    n.has(c) ? n.delete(c) : n.add(c);
    setCats(n);
  };

  const toggleFav = async (id: string) => {
    if (!user) return;
    const on = !favs.has(id);
    const next = new Set(favs);
    on ? next.add(id) : next.delete(id);
    setFavs(next);
    try {
      await toggleFavorite(user.id, "song", id, on);
    } catch {
      toast.error("Nie udało się zapisać");
    }
  };

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-green))]" />
        <h1 className="text-3xl font-bold">Śpiewnik</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Wyszukaj piosenkę po tytule lub fragmencie tekstu.</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj piosenki…" className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SONG_CATEGORIES.map((c) => {
          const active = cats.has(c);
          return (
            <button
              key={c}
              onClick={() => toggleCat(c)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                active ? "bg-[hsl(var(--sk-green))] text-[hsl(var(--sk-green-foreground))] border-transparent" : "bg-secondary"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {songs.length === 0 ? "Brak piosenek. Instruktor doda je z panelu admina." : "Brak wyników."}
        </div>
      )}

      <ul className="divide-y rounded-lg border bg-card">
        {filtered.map((s) => (
          <li key={s.id} className="flex items-center gap-2 px-3 py-2">
            <Link to={`/spiewnik/${s.id}`} className="flex-1 min-w-0 py-1.5">
              <div className="font-medium truncate">{highlight(s.title, q)}</div>
              {s.categories.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {s.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              )}
            </Link>
            <FavoriteButton active={favs.has(s.id)} onClick={() => toggleFav(s.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Songbook;
