CREATE TABLE public.threat_tickets (
    threat_key TEXT PRIMARY KEY,
    issue_url TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.threat_tickets TO anon, authenticated;
GRANT ALL ON public.threat_tickets TO service_role;

ALTER TABLE public.threat_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ticket links"
    ON public.threat_tickets FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can save ticket links"
    ON public.threat_tickets FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        char_length(threat_key) BETWEEN 1 AND 100
        AND issue_url LIKE 'https://github.com/%'
        AND issue_number BETWEEN 1 AND 9999999
    );