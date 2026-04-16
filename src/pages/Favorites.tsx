import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Music2, BookOpen } from "lucide-react";

interface Item { id: string; title: string; type: "song" | "law"; }

const Favorites = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: favs } = await supabase
        .from("favorites").select("item_type,item_id").eq("user_id", user.id);
      const songIds = favs?.filter((f) => f.item_type === "song").map((f) => f.item_id) ?? [];
      const lawIds = favs?.filter((f) => f.item_type === "law").map((f) => f.item_id) ?? [];
      const [songs, laws] = await Promise.all([
        songIds.length ? supabase.from("songs").select("id,title").in("id", songIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
        lawIds.length ? supabase.from("law_points").select("id,title,number").in("id", lawIds) : Promise.resolve({ data: [] as { id: string; title: string; number: number }[] }),
      ]);
      const all: Item[] = [
        ...(songs.data ?? []).map((s) => ({ id: s.id, title: s.title, type: "song" as const })),
        ...(laws.data ?? []).map((l: any) => ({ id: l.id, title: `${l.number}. ${l.title}`, type: "law" as const })),
      ];
      setItems(all);
    })();
  }, [user]);

  const songs = items.filter((i) => i.type === "song");
  const laws = items.filter((i) => i.type === "law");

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-yellow))]" />
        <h1 className="text-3xl font-bold">Ulubione</h1>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          Nic tu jeszcze nie ma. Oznacz gwiazdką ⭐ piosenki lub punkty Prawa.
        </p>
      )}

      {songs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
            <Music2 className="h-4 w-4" /> Piosenki
          </h2>
          <ul className="divide-y rounded-lg border bg-card">
            {songs.map((s) => (
              <li key={s.id}>
                <Link to={`/spiewnik/${s.id}`} className="block px-4 py-3 hover:bg-secondary transition-colors">{s.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {laws.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Prawo
          </h2>
          <ul className="divide-y rounded-lg border bg-card">
            {laws.map((l) => (
              <li key={l.id}>
                <Link to="/prawo" className="block px-4 py-3 hover:bg-secondary transition-colors">{l.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Favorites;
