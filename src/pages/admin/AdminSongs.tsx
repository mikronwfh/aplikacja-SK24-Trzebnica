import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SONG_CATEGORIES } from "@/pages/Songbook";
import { useAuth } from "@/lib/auth";

interface Song { id: string; title: string; body: string; categories: string[]; }
const empty: Omit<Song, "id"> = { title: "", body: "", categories: [] };

const AdminSongs = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Song[]>([]);
  const [editing, setEditing] = useState<Song | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("songs").select("id,title,body,categories").order("title");
    setRows((data ?? []) as Song[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Tytuł wymagany");
    const payload = { title: editing.title, body: editing.body, categories: editing.categories };
    const { error } = editing.id
      ? await supabase.from("songs").update(payload).eq("id", editing.id)
      : await supabase.from("songs").insert({ ...payload, created_by: user?.id });
    if (error) toast.error(error.message); else { toast.success("Zapisano"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć tę piosenkę?")) return;
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Usunięto"); load(); }
  };

  const toggleCat = (c: string) => {
    if (!editing) return;
    const has = editing.categories.includes(c);
    setEditing({ ...editing, categories: has ? editing.categories.filter((x) => x !== c) : [...editing.categories, c] });
  };

  const insertMd = (md: string) => {
    if (!editing) return;
    setEditing({ ...editing, body: editing.body + (editing.body ? "\n" : "") + md });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing({ id: "", ...empty }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Dodaj piosenkę
        </Button>
      </div>
      <div className="rounded-lg border bg-card divide-y">
        {rows.length === 0 && <div className="p-6 text-muted-foreground text-center">Brak piosenek.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.title}</div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {r.categories.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edytuj piosenkę" : "Nowa piosenka"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Tytuł</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div>
                <Label>Kategorie</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SONG_CATEGORIES.map((c) => {
                    const active = editing.categories.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => toggleCat(c)}
                        className={`text-xs px-3 py-1 rounded-full border ${active ? "bg-[hsl(var(--sk-green))] text-[hsl(var(--sk-green-foreground))] border-transparent" : "bg-secondary"}`}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Tekst piosenki</Label>
                <div className="flex gap-1 my-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => insertMd("# Nagłówek")}>H1</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => insertMd("## Refren")}>H2</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => insertMd("- ")}>Lista</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => insertMd("[tekst](https://)")}>Link</Button>
                </div>
                <Textarea rows={14} className="font-mono text-sm" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
                <p className="text-xs text-muted-foreground mt-1">Pusta linia = nowa zwrotka. Tekst zachowuje formatowanie.</p>
              </div>
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

export default AdminSongs;
