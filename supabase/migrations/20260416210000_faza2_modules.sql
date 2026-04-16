-- Symbolika
CREATE TABLE public.symbolika_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.symbolika_entries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER symbolika_updated_at BEFORE UPDATE ON public.symbolika_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Symbolika public read" ON public.symbolika_entries FOR SELECT USING (true);
CREATE POLICY "Symbolika instructor insert" ON public.symbolika_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Symbolika instructor update" ON public.symbolika_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Symbolika instructor delete" ON public.symbolika_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- Mundur
CREATE TABLE public.mundur_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mundur_entries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER mundur_updated_at BEFORE UPDATE ON public.mundur_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Mundur auth read" ON public.mundur_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mundur instructor insert" ON public.mundur_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Mundur instructor update" ON public.mundur_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Mundur instructor delete" ON public.mundur_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- Znaki patrolowe
CREATE TABLE public.patrol_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patrol_signs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER patrol_signs_updated_at BEFORE UPDATE ON public.patrol_signs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Patrol signs auth read" ON public.patrol_signs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Patrol signs instructor insert" ON public.patrol_signs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Patrol signs instructor update" ON public.patrol_signs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Patrol signs instructor delete" ON public.patrol_signs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- Sprawności
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER skills_updated_at BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Skills auth read" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Skills instructor insert" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Skills instructor update" ON public.skills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Skills instructor delete" ON public.skills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- Storage bucket dla mediów (zdjęcia/grafiki)
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Media public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Media instructor upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Media instructor delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'instructor'));
