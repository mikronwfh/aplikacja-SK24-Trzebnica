import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Zdjęcie / grafika" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Błąd uploadu: " + error.message);
    } else {
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Zdjęcie wgrane");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="podgląd" className="h-32 w-auto rounded border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-white p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="lub wklej URL zdjęcia…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => ref.current?.click()}>
          <Upload className="h-4 w-4" />
        </Button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
      />
    </div>
  );
}
