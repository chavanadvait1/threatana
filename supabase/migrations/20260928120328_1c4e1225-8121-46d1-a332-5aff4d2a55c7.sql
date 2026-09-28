DROP POLICY "Anyone can save analyses" ON public.log_analyses;
CREATE POLICY "Anyone can save valid analyses" ON public.log_analyses FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(raw_log) BETWEEN 1 AND 20000
  AND char_length(title) BETWEEN 1 AND 300
  AND char_length(category) BETWEEN 1 AND 100
  AND severity IN ('low','medium','high','critical')
  AND ioc_count BETWEEN 0 AND 500
  AND created_at BETWEEN now() - interval '1 minute' AND now() + interval '1 minute'
);