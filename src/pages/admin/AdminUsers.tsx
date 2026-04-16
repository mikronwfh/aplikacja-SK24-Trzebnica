import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AppRole } from "@/lib/auth";

interface Row {
  id: string;
  display_name: string | null;
  active: boolean;
  roles: AppRole[];
  email?: string;
}

const AdminUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "scout" as AppRole });

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, active"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const rolesByUser = new Map<string, AppRole[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });
    setRows((profiles ?? []).map((p: any) => ({
      id: p.id,
      display_name: p.display_name,
      active: p.active,
      roles: rolesByUser.get(p.id) ?? [],
    })));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.email || !form.password) return toast.error("Podaj e-mail i hasło");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", { body: form });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast.error("Nie udało się utworzyć konta", { description: (data as any)?.error ?? error?.message });
    } else {
      toast.success("Utworzono konto");
      setOpen(false);
      setForm({ email: "", password: "", display_name: "", role: "scout" });
      load();
    }
  };

  const setRole = async (userId: string, role: AppRole) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error("Błąd"); else { toast.success("Zaktualizowano rolę"); load(); }
  };

  const setActive = async (userId: string, active: boolean) => {
    const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);
    if (error) toast.error("Błąd"); else load();
  };

  const remove = async (userId: string) => {
    if (!confirm("Usunąć konto na stałe?")) return;
    const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: userId } });
    if (error || (data as any)?.error) toast.error("Błąd usuwania");
    else { toast.success("Usunięto"); load(); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Dodaj konto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nowe konto</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Hasło</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>Imię / nazwa wyświetlana</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
              <div>
                <Label>Rola</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AppRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Rodzic</SelectItem>
                    <SelectItem value="scout">Skaut</SelectItem>
                    <SelectItem value="instructor">Instruktor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
              <Button onClick={create} disabled={busy}>{busy ? "Tworzenie…" : "Utwórz"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card divide-y">
        {rows.length === 0 && <div className="p-6 text-muted-foreground text-center">Brak kont.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.display_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground truncate">ID: {r.id}</div>
            </div>
            <Select value={r.roles[0] ?? ""} onValueChange={(v) => setRole(r.id, v as AppRole)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="brak roli" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Rodzic</SelectItem>
                <SelectItem value="scout">Skaut</SelectItem>
                <SelectItem value="instructor">Instruktor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant={r.active ? "outline" : "secondary"} onClick={() => setActive(r.id, !r.active)}>
              {r.active ? "Aktywne" : "Wyłączone"}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => remove(r.id)} aria-label="Usuń">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
