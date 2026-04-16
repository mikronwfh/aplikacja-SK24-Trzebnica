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

interface SymbolikaEntry {
  id: string;
  title: string;
  body: string;
  image_url: string;
  sort_order: number;
}

const Symbolika = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SymbolikaEntry[]>([]);
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("symbolika_entries").select("*").order("sort_order").order("title").then(({ data, error }) => {
      if (error) toast.error("Błąd ładowania symboliki");
      else setEntries((data ?? []) as SymbolikaEntry[]);
    });
  }, []);

  useEffect(() => {
    if (!user) return setFavs(new Set());
    listFavorites(user.id).then((rows) => {
      setFavs(new Set(rows.filter((r) => r.item_type === "symbolika").map((r) => r.item_id)));
    });
  }, [user]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return entries;
    return entries.filter((e) => e.title.toLowerCase().includes(s) || e.body.toLowerCase().includes(s));
  }, [entries, q]);

  const toggle = async (id: string) => {
    if (!user) return toast.info("Zaloguj się, aby dodać do ulubionych");
    const on = !favs.has(id);
    const next = new Set(favs);
    on ? next.add(id) : next.delete(id);
    setFavs(next);
    try { await toggleFavorite(user.id, "symbolika", id, on); }
    catch { toast.error("Nie udało się zapisać"); }
  };

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[hsl(var(--sk-yellow))]" />
          <h1 className="text-3xl font-bold">Symbolika</h1>
        </div>
        <p className="text-sm text-muted-foreground">Symbole, ich znaczenie, historia i geneza.</p>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Szukaj w symbolice…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {entries.length === 0 ? "Brak wpisów. Instruktor doda symbolikę z panelu admina." : "Brak wyników."}
        </div>
      )}

      <Accordion type="multiple" className="space-y-2">
        {filtered.map((e) => (
          <AccordionItem key={e.id} value={e.id} className="border rounded-lg px-3 bg-card">
            <div className="flex items-center gap-2">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  {e.image_url && (
                    <img src={e.image_url} alt={e.title} className="h-10 w-10 rounded object-cover flex-shrink-0" />
                  )}
                  <span className="font-medium">{e.title}</span>
                </div>
              </AccordionTrigger>
              <FavoriteButton active={favs.has(e.id)} onClick={() => toggle(e.id)} />
            </div>
            <AccordionContent>
              {e.image_url && (
                <img src={e.image_url} alt={e.title} className="rounded-lg mb-4 max-h-64 object-contain" />
              )}
              <Markdown>{e.body}</Markdown>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Symbolika;
