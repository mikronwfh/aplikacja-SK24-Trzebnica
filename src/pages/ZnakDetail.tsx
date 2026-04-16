import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/favorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface PatrolSign {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

const ZnakDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [sign, setSign] = useState<PatrolSign | null>(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("patrol_signs").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) toast.error("Nie znaleziono znaku");
      else setSign(data as PatrolSign);
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    listFavorites(user.id).then((rows) => {
      setIsFav(rows.some((r) => r.item_type === "patrol_sign" && r.item_id === id));
    });
  }, [user, id]);

  const toggle = async () => {
    if (!user || !id) return toast.info("Zaloguj się, aby dodać do ulubionych");
    const on = !isFav;
    setIsFav(on);
    try { await toggleFavorite(user.id, "patrol_sign", id, on); }
    catch { toast.error("Nie udało się zapisać"); }
  };

  if (!sign) return <div className="container py-12 text-center text-muted-foreground">Ładowanie…</div>;

  return (
    <div className="container py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/znaki-patrolowe"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{sign.name}</h1>
        <FavoriteButton active={isFav} onClick={toggle} />
      </div>

      {sign.image_url && (
        <img src={sign.image_url} alt={sign.name} className="rounded-xl mb-6 w-full max-h-80 object-contain bg-secondary" />
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown>{sign.description}</Markdown>
      </div>
    </div>
  );
};

export default ZnakDetail;
