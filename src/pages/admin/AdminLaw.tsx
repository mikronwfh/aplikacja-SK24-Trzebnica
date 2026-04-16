import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LawPoint { id: string; number: number; title: string; body: string; comment: string; sort_order: number; }

const empty: Omit<LawPoint, "id"> = { number: 1, title: "", body: "", comment: "", sort_order: 0 };

const AdminLaw = () => {
  const [rows, setRows] = useState<LawPoint[]>([]);
  const [editing, setEditing] = useState<LawPoint | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("law_points").select("*").order("sort_order").order("number");
    setRows((data ?? []) as LawPoint[]);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ id: "", ...empty, number: rows.length + 1, sort_order: rows.length }); setOpen(true); };
  const startEdit = (r: LawPoint) => { setEditing(r); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Tytuł wymagany");
    const payload = { number: editing.number, title: editing.title, body: editing.body, comment: editing.comment, sort_order: editing.sort_order };
    const { error } = editing.id
      ? await supabase.from("law_points").update(payload).eq("id", editing.id)
      : await supabase.from("law_points").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Zapisano"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć ten punkt?")) return;
    const { error } = await supabase.from("law_points").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Usunięto"); load(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-2" />Dodaj punkt</Button>
      </div>
      <div className="rounded-lg border bg-card divide-y">
        {rows.length === 0 && <div className="p-6 text-muted-foreground text-center">Brak punktów.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center gap-3">
            <span className="text-xl font-bold text-[hsl(var(--sk-blue))] tabular-nums w-10">{r.number}.</span>
            <div className="flex-1 min-w-0 truncate">{r.title}</div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edytuj punkt" : "Nowy punkt"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Numer</Label><Input type="number" value={editing.number} onChange={(e) => setEditing({ ...editing, number: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Kolejność</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div><Label>Tytuł</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Treść (Markdown)</Label><Textarea rows={6} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
              <div><Label>Komentarz (Markdown)</Label><Textarea rows={5} value={editing.comment} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">Markdown: <code># Nagłówek</code>, <code>## Podtytuł</code>, <code>- lista</code>, <code>[link](https://...)</code></p>
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

export default AdminLaw;
