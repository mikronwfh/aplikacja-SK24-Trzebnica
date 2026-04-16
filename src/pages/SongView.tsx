import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/favorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Copy, Maximize2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface Song {
  id: string;
  title: string;
  body: string;
  categories: string[];
}

const SongView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("songs").select("id,title,body,categories").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setSong(data as Song);
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    listFavorites(user.id).then((rows) => {
      setFav(rows.some((r) => r.item_type === "song" && r.item_id === id));
    });
  }, [user, id]);

  const onCopy = async () => {
    if (!song) return;
    await navigator.clipboard.writeText(`${song.title}\n\n${song.body}`);
    toast.success("Skopiowano do schowka");
  };

  const onFav = async () => {
    if (!user || !id) return;
    const on = !fav;
    setFav(on);
    try { await toggleFavorite(user.id, "song", id, on); } catch { toast.error("Błąd"); }
  };

  if (!song) return <div className="container py-8 text-muted-foreground">Ładowanie…</div>;

  return (
    <div className="container py-6 max-w-3xl">
      <Link to="/spiewnik" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="h-4 w-4" /> Wróć do śpiewnika
      </Link>
      <div className="flex items-start gap-2 mb-2">
        <h1 className="text-3xl font-bold flex-1">{song.title}</h1>
        <FavoriteButton active={fav} onClick={onFav} />
      </div>
      {song.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {song.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={onCopy}><Copy className="h-4 w-4 mr-2" />Kopiuj tekst</Button>
        <Button asChild size="sm">
          <Link to={`/spiewnik/full/${song.id}`}><Maximize2 className="h-4 w-4 mr-2" />Tryb pełnoekranowy</Link>
        </Button>
      </div>
      <div className="prose-song text-lg leading-relaxed bg-card border rounded-lg p-5">
        {song.body || <span className="text-muted-foreground">Brak tekstu.</span>}
      </div>
    </div>
  );
};

export default SongView;
