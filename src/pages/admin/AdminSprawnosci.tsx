import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Skill { id: string; name: string; description: string; requirements: string; image_url: string; category: string; sort_order: number; }
const empty: Omit<Skill, "id"> = { name: "", description: "", requirements: "", image_url: "", category: "", sort_order: 0 };

const AdminSprawnosci = () => {
  const [rows, setRows] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("skills").select("*").order("sort_order").order("name");
    setRows((data ?? []) as Skill[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Nazwa wymagana");
    const payload = { name: editing.name, description: editing.description, requirements: editing.requirements, image_url: editing.image_url, category: editing.category, sort_order: editing.sort_order };
    const { error } = editing.id
      ? await supabase.from("skills").update(payload).eq("id", editing.id)
      : await supabase.from("skills").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Zapisano"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć sprawność?")) return;
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Usunięto"); load(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing({ id: "", ...empty, sort_order: rows.length }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Dodaj sprawność
        </Button>
      </div>
      <div className="rounded-lg border bg-card divide-y">
        {rows.length === 0 && <div className="p-6 text-muted-foreground text-center">Brak sprawności.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center gap-3">
            {r.image_url && <img src={r.image_url} alt={r.name} className="h-8 w-8 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="truncate">{r.name}</div>
              {r.category && <Badge variant="secondary" className="text-xs">{r.category}</Badge>}
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edytuj sprawność" : "Nowa sprawność"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Nazwa</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Kategoria / dział</Label><Input placeholder="np. Przyroda, Sport, Sztuka…" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><Label>Kolejność</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} label="Odznaka / grafika" />
              <div><Label>Opis (Markdown)</Label><Textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Wymagania do zdobycia (Markdown)</Label><Textarea rows={6} value={editing.requirements} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">Markdown: <code>- zadanie 1</code>, <code>## Sekcja</code></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
            <Button onClick={save}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSprawnosci;
