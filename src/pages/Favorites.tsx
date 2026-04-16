import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Music2, BookOpen, Gem, Shirt, FlameKindling, Award } from "lucide-react";

type FavType = "song" | "law" | "symbolika" | "mundur" | "patrol_sign" | "skill";
interface Item { id: string; title: string; type: FavType; }

const SECTIONS: { type: FavType; label: string; icon: React.ReactNode; href: (id: string) => string }[] = [
  { type: "song", label: "Piosenki", icon: <Music2 className="h-4 w-4" />, href: (id) => `/spiewnik/${id}` },
  { type: "law", label: "Prawo", icon: <BookOpen className="h-4 w-4" />, href: () => "/prawo" },
  { type: "symbolika", label: "Symbolika", icon: <Gem className="h-4 w-4" />, href: () => "/symbolika" },
  { type: "mundur", label: "Mundur", icon: <Shirt className="h-4 w-4" />, href: () => "/mundur" },
  { type: "patrol_sign", label: "Znaki patrolowe", icon: <FlameKindling className="h-4 w-4" />, href: (id) => `/znaki-patrolowe/${id}` },
  { type: "skill", label: "Sprawności", icon: <Award className="h-4 w-4" />, href: (id) => `/sprawnosci/${id}` },
];

const Favorites = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: favs } = await supabase.from("favorites").select("item_type,item_id").eq("user_id", user.id);
      if (!favs?.length) return;

      const byType = (type: string) => favs.filter((f) => f.item_type === type).map((f) => f.item_id);

      const [songs, laws, symbolika, mundur, signs, skills] = await Promise.all([
        byType("song").length ? supabase.from("songs").select("id,title").in("id", byType("song")) : Promise.resolve({ data: [] }),
        byType("law").length ? supabase.from("law_points").select("id,title,number").in("id", byType("law")) : Promise.resolve({ data: [] }),
        byType("symbolika").length ? supabase.from("symbolika_entries").select("id,title").in("id", byType("symbolika")) : Promise.resolve({ data: [] }),
        byType("mundur").length ? supabase.from("mundur_entries").select("id,title").in("id", byType("mundur")) : Promise.resolve({ data: [] }),
        byType("patrol_sign").length ? supabase.from("patrol_signs").select("id,name").in("id", byType("patrol_sign")) : Promise.resolve({ data: [] }),
        byType("skill").length ? supabase.from("skills").select("id,name").in("id", byType("skill")) : Promise.resolve({ data: [] }),
      ]);

      const all: Item[] = [
        ...(songs.data ?? []).map((s: any) => ({ id: s.id, title: s.title, type: "song" as const })),
        ...(laws.data ?? []).map((l: any) => ({ id: l.id, title: `${l.number}. ${l.title}`, type: "law" as const })),
        ...(symbolika.data ?? []).map((s: any) => ({ id: s.id, title: s.title, type: "symbolika" as const })),
        ...(mundur.data ?? []).map((m: any) => ({ id: m.id, title: m.title, type: "mundur" as const })),
        ...(signs.data ?? []).map((z: any) => ({ id: z.id, title: z.name, type: "patrol_sign" as const })),
        ...(skills.data ?? []).map((sk: any) => ({ id: sk.id, title: sk.name, type: "skill" as const })),
      ];
      setItems(all);
    })();
  }, [user]);

  const hasFavs = items.length > 0;

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-yellow))]" />
        <h1 className="text-3xl font-bold">Ulubione</h1>
      </div>

      {!hasFavs && (
        <p className="text-muted-foreground text-center py-12">
          Nic tu jeszcze nie ma. Oznacz gwiazdką ⭐ piosenki, prawo lub inne treści.
        </p>
      )}

      {SECTIONS.map(({ type, label, icon, href }) => {
        const section = items.filter((i) => i.type === type);
        if (!section.length) return null;
        return (
          <section key={type} className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
              {icon} {label}
            </h2>
            <ul className="divide-y rounded-lg border bg-card">
              {section.map((s) => (
                <li key={s.id}>
                  <Link to={href(s.id)} className="block px-4 py-3 hover:bg-secondary transition-colors">{s.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default Favorites;
