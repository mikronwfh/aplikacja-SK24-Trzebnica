import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { listFavorites, toggleFavorite } from "@/lib/favorites";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  description: string;
  requirements: string;
  image_url: string;
  category: string;
}

const SprawnosdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("skills").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) toast.error("Nie znaleziono sprawności");
      else setSkill(data as Skill);
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    listFavorites(user.id).then((rows) => {
      setIsFav(rows.some((r) => r.item_type === "skill" && r.item_id === id));
    });
  }, [user, id]);

  const toggle = async () => {
    if (!user || !id) return toast.info("Zaloguj się, aby dodać do ulubionych");
    const on = !isFav;
    setIsFav(on);
    try { await toggleFavorite(user.id, "skill", id, on); }
    catch { toast.error("Nie udało się zapisać"); }
  };

  if (!skill) return <div className="container py-12 text-center text-muted-foreground">Ładowanie…</div>;

  return (
    <div className="container py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/sprawnosci"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{skill.name}</h1>
          {skill.category && <Badge variant="secondary" className="mt-1">{skill.category}</Badge>}
        </div>
        <FavoriteButton active={isFav} onClick={toggle} />
      </div>

      {skill.image_url && (
        <img src={skill.image_url} alt={skill.name} className="rounded-xl mb-6 w-full max-h-64 object-contain bg-secondary" />
      )}

      {skill.description && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Opis</h2>
          <Markdown>{skill.description}</Markdown>
        </div>
      )}

      {skill.requirements && (
        <div className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Wymagania do zdobycia</h2>
          <Markdown>{skill.requirements}</Markdown>
        </div>
      )}
    </div>
  );
};

export default SprawnosdDetail;
