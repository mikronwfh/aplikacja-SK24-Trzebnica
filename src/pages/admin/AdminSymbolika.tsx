import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Entry { id: string; title: string; body: string; image_url: string; sort_order: number; }
const empty: Omit<Entry, "id"> = { title: "", body: "", image_url: "", sort_order: 0 };

const AdminSymbolika = () => {
  const [rows, setRows] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("symbolika_entries").select("*").order("sort_order").order("title");
    setRows((data ?? []) as Entry[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Tytuł wymagany");
    const payload = { title: editing.title, body: editing.body, image_url: editing.image_url, sort_order: editing.sort_order };
    const { error } = editing.id
      ? await supabase.from("symbolika_entries").update(payload).eq("id", editing.id)
      : await supabase.from("symbolika_entries").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Zapisano"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć wpis?")) return;
    const { error } = await supabase.from("symbolika_entries").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Usunięto"); load(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing({ id: "", ...empty, sort_order: rows.length }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Dodaj symbol
        </Button>
      </div>
      <div className="rounded-lg border bg-card divide-y">
        {rows.length === 0 && <div className="p-6 text-muted-foreground text-center">Brak wpisów.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center gap-3">
            {r.image_url && <img src={r.image_url} alt={r.title} className="h-8 w-8 rounded object-cover" />}
            <div className="flex-1 min-w-0 truncate">{r.title}</div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edytuj symbol" : "Nowy symbol"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Tytuł</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Kolejność</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              <div><Label>Treść (Markdown)</Label><Textarea rows={8} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">Markdown: <code># Nagłówek</code>, <code>- lista</code>, <code>[link](https://...)</code></p>
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

export default AdminSymbolika;
