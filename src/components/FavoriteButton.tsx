import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  active,
  onClick,
  size = "icon",
  className,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: "icon" | "sm";
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size === "icon" ? "icon" : "sm"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick(e);
      }}
      aria-label={active ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      className={cn(className)}
    >
      <Star className={cn("h-5 w-5", active ? "fill-[hsl(var(--sk-yellow))] text-[hsl(var(--sk-yellow))]" : "text-muted-foreground")} />
    </Button>
  );
}
