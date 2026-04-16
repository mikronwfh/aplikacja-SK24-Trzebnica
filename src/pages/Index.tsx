import { Link } from "react-router-dom";
import logo from "@/assets/skauci-logo.png";
import { Button } from "@/components/ui/button";
import { BookOpen, Music2, Users, Gem, Shirt, FlameKindling, Award } from "lucide-react";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-b from-secondary to-background">
        <div className="container py-12 md:py-20 text-center">
          <img src={logo} alt="Logo Skautów Króla" className="mx-auto h-24 w-24 md:h-32 md:w-32 mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            Skauci Króla
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Podręczna biblioteka skautowska — Prawo, Śpiewnik i wszystko, czego potrzebujesz na zbiórce, biwaku
            i przy ognisku.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg"><Link to="/prawo">Prawo Skautowe</Link></Button>
            {!user && (
              <Button asChild size="lg" variant="outline"><Link to="/logowanie">Zaloguj się</Link></Button>
            )}
          </div>
        </div>
      </section>

      <section className="container py-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card to="/prawo" color="blue" icon={<BookOpen />} title="Prawo Skautowe" desc="Fundament tożsamości — pełen tekst Prawa z komentarzem." />
        <Card to="/symbolika" color="yellow" icon={<Gem />} title="Symbolika" desc="Krzyż, lilijka, chusta — znaczenie i historia symboli SK." />
        {user && <Card to="/mundur" color="red" icon={<Shirt />} title="Mundur" desc="Co, gdzie i jak się nosi. Elementy, oznaczenia, zasady." />}
        {user && <Card to="/spiewnik" color="green" icon={<Music2 />} title="Śpiewnik" desc="Piosenki ogniskowe, pielgrzymkowe i liturgiczne. Tryb pełnoekranowy." />}
        {user && <Card to="/znaki-patrolowe" color="green" icon={<FlameKindling />} title="Znaki patrolowe" desc="Galeria znaków z opisem i kontekstem użycia." />}
        {user && <Card to="/sprawnosci" color="blue" icon={<Award />} title="Sprawności" desc="Katalog sprawności — wymagania i odznaki." />}
        <Card to="/o-nas" color="red" icon={<Users />} title="Kim jesteśmy" desc="Skauci Króla, Domowy Kościół, Ruch Światło-Życie." />
      </section>
    </div>
  );
};

function Card({
  to, color, icon, title, desc,
}: { to: string; color: "blue" | "green" | "red" | "yellow"; icon: React.ReactNode; title: string; desc: string }) {
  const bg: Record<string, string> = {
    blue: "bg-[hsl(var(--sk-blue))] text-[hsl(var(--sk-blue-foreground))]",
    green: "bg-[hsl(var(--sk-green))] text-[hsl(var(--sk-green-foreground))]",
    red: "bg-[hsl(var(--sk-red))] text-[hsl(var(--sk-red-foreground))]",
    yellow: "bg-[hsl(var(--sk-yellow))] text-[hsl(var(--sk-yellow-foreground))]",
  };
  return (
    <Link to={to} className="rounded-xl border bg-card hover:shadow-md transition-shadow p-5 flex gap-4 items-start">
      <div className={`rounded-lg p-3 ${bg[color]}`}>{icon}</div>
      <div>
        <div className="font-semibold text-lg">{title}</div>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </Link>
  );
}

export default Index;
