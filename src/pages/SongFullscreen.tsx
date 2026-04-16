import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Sun, Moon, Copy } from "lucide-react";
import { toast } from "sonner";

interface Song { id: string; title: string; body: string; }

const SongFullscreen = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [fontSize, setFontSize] = useState(28);
  const [dark, setDark] = useState(true);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("songs").select("id,title,body").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setSong(data as Song);
    });
  }, [id]);

  useEffect(() => {
    const lock = async () => {
      try {
        // @ts-ignore
        if ("wakeLock" in navigator) wakeRef.current = await (navigator as any).wakeLock.request("screen");
      } catch {}
    };
    lock();
    return () => { wakeRef.current?.release().catch(() => {}); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") nav(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  const onCopy = async () => {
    if (!song) return;
    await navigator.clipboard.writeText(`${song.title}\n\n${song.body}`);
    toast.success("Skopiowano");
  };

  const bg = dark ? "bg-black text-white" : "bg-white text-black";

  return (
    <div className={`fixed inset-0 z-50 ${bg} overflow-y-auto`}>
      <div className="sticky top-0 flex items-center justify-between gap-2 p-3 backdrop-blur bg-inherit/80 border-b border-current/10">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)} aria-label="Zamknij"><X /></Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setFontSize((s) => Math.max(14, s - 2))} aria-label="Mniejsza czcionka"><Minus /></Button>
          <span className="w-10 text-center text-sm tabular-nums">{fontSize}</span>
          <Button variant="ghost" size="icon" onClick={() => setFontSize((s) => Math.min(72, s + 2))} aria-label="Większa czcionka"><Plus /></Button>
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Przełącz tło">{dark ? <Sun /> : <Moon />}</Button>
          <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Kopiuj"><Copy /></Button>
        </div>
      </div>
      {song ? (
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <h1 className="font-bold mb-6 text-balance" style={{ fontSize: fontSize * 1.2 }}>{song.title}</h1>
          <div className="prose-song" style={{ fontSize }}>{song.body}</div>
        </div>
      ) : (
        <div className="p-8 text-center opacity-70">Ładowanie…</div>
      )}
    </div>
  );
};

export default SongFullscreen;
