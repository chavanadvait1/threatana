ALTER TABLE public.log_analyses ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.log_analyses ADD COLUMN IF NOT EXISTS indicators jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE public.threat_resolutions (
  threat_key text PRIMARY KEY,
  resolved boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.threat_resolutions TO anon, authenticated;
GRANT ALL ON public.threat_resolutions TO service_role;
ALTER TABLE public.threat_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view resolutions" ON public.threat_resolutions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add resolutions" ON public.threat_resolutions FOR INSERT TO anon, authenticated WITH CHECK (char_length(threat_key) BETWEEN 1 AND 64);
CREATE POLICY "Anyone can update resolutions" ON public.threat_resolutions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (char_length(threat_key) BETWEEN 1 AND 64);