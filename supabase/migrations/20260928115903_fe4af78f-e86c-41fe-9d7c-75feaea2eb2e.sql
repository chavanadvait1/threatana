CREATE TABLE public.log_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_log text NOT NULL CHECK (char_length(raw_log) BETWEEN 1 AND 20000),
  title text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  novel boolean NOT NULL DEFAULT false,
  ioc_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.log_analyses TO anon, authenticated;
GRANT ALL ON public.log_analyses TO service_role;
ALTER TABLE public.log_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view analyses" ON public.log_analyses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can save analyses" ON public.log_analyses FOR INSERT TO anon, authenticated WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.log_analyses;