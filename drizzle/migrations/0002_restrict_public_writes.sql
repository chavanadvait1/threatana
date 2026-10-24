-- Resolution marks are toggled through the app's server function only;
-- direct public writes are removed.
DROP POLICY IF EXISTS "Anyone can add resolutions" ON public.threat_resolutions;
DROP POLICY IF EXISTS "Anyone can update resolutions" ON public.threat_resolutions;
REVOKE INSERT, UPDATE ON public.threat_resolutions FROM anon, authenticated;
GRANT SELECT ON public.threat_resolutions TO anon, authenticated;
GRANT ALL ON public.threat_resolutions TO service_role;

-- GitHub ticket links are written only inside the server function that
-- creates the issue; direct public inserts are removed.
DROP POLICY IF EXISTS "Anyone can save ticket links" ON public.threat_tickets;
REVOKE INSERT ON public.threat_tickets FROM anon, authenticated;
GRANT SELECT ON public.threat_tickets TO anon, authenticated;
GRANT ALL ON public.threat_tickets TO service_role;