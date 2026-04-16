-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('parent', 'scout', 'instructor');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Law points
CREATE TABLE public.law_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.law_points ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER law_points_updated_at BEFORE UPDATE ON public.law_points
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Songs
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  categories TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER songs_updated_at BEFORE UPDATE ON public.songs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "Own profile readable" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Instructors read all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Own profile updatable" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Instructors update profiles" ON public.profiles
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- RLS: user_roles
CREATE POLICY "Own roles readable" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Instructors read all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Instructors manage roles ins" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Instructors manage roles upd" ON public.user_roles
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Instructors manage roles del" ON public.user_roles
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- RLS: law_points (public read)
CREATE POLICY "Law public read" ON public.law_points
FOR SELECT USING (true);
CREATE POLICY "Law instructor insert" ON public.law_points
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Law instructor update" ON public.law_points
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Law instructor delete" ON public.law_points
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- RLS: songs (auth read)
CREATE POLICY "Songs auth read" ON public.songs
FOR SELECT TO authenticated USING (true);
CREATE POLICY "Songs instructor insert" ON public.songs
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Songs instructor update" ON public.songs
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Songs instructor delete" ON public.songs
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'instructor'));

-- RLS: favorites (own only)
CREATE POLICY "Own favorites read" ON public.favorites
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own favorites insert" ON public.favorites
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own favorites delete" ON public.favorites
FOR DELETE TO authenticated USING (auth.uid() = user_id);