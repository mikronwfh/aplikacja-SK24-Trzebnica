import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/favorites";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Markdown } from "@/components/Markdown";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface LawPoint {
  id: string;
  number: number;
  title: string;
  body: string;
  comment: string;
  sort_order: number;
}

const Law = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState<LawPoint[]>([]);
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("law_points").select("*").order("sort_order").order("number").then(({ data, error }) => {
      if (error) toast.error("Błąd ładowania prawa");
      else setPoints((data ?? []) as LawPoint[]);
    });
  }, []);

  useEffect(() => {
    if (!user) return setFavs(new Set());
    listFavorites(user.id).then((rows) => {
      setFavs(new Set(rows.filter((r) => r.item_type === "law").map((r) => r.item_id)));
    });
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return points;
    return points.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.body.toLowerCase().includes(s) ||
        p.comment.toLowerCase().includes(s),
    );
  }, [points, q]);

  const toggle = async (id: string) => {
    if (!user) return toast.info("Zaloguj się, aby dodać do ulubionych");
    const on = !favs.has(id);
    const next = new Set(favs);
    on ? next.add(id) : next.delete(id);
    setFavs(next);
    try {
      await toggleFavorite(user.id, "law", id, on);
    } catch {
      toast.error("Nie udało się zapisać");
    }
  };

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-blue))]" />
          <h1 className="text-3xl font-bold">Prawo Skautowe</h1>
        </div>
        <p className="text-sm text-muted-foreground">Pełen tekst Prawa z komentarzami.</p>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Szukaj w Prawie…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {points.length === 0 ? "Brak wpisów. Instruktor doda Prawo z panelu admina." : "Brak wyników."}
        </div>
      )}

      <Accordion type="multiple" className="space-y-2">
        {filtered.map((p) => (
          <AccordionItem key={p.id} value={p.id} className="border rounded-lg px-3 bg-card">
            <div className="flex items-center gap-2">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-baseline gap-3 text-left">
                  <span className="text-2xl font-bold text-[hsl(var(--sk-blue))] tabular-nums">{p.number}.</span>
                  <span className="font-medium">{p.title}</span>
                </div>
              </AccordionTrigger>
              <FavoriteButton active={favs.has(p.id)} onClick={() => toggle(p.id)} />
            </div>
            <AccordionContent>
              {p.body && <Markdown>{p.body}</Markdown>}
              {p.comment && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Komentarz</div>
                  <Markdown>{p.comment}</Markdown>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Law;
