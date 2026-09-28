import { useEffect, useState } from "react";
import { History, Search, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { severityColor } from "@/lib/threat-data";

type Row = {
  id: string;
  raw_log: string;
  title: string;
  category: string;
  severity: string;
  novel: boolean;
  ioc_count: number;
  created_at: string;
};

export function AnalysisHistory() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let query = supabase.from("log_analyses").select("*").order("created_at", { ascending: false }).limit(50);
      const term = q.trim().replace(/[%,()]/g, "");
      if (term) query = query.or(`raw_log.ilike.%${term}%,category.ilike.%${term}%,title.ilike.%${term}%`);
      const { data } = await query;
      if (!cancelled) {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    const onChange = () => load();
    window.addEventListener("log-analyses-changed", onChange);
    const ch = supabase
      .channel("log_analyses_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "log_analyses" }, onChange)
      .subscribe();
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("log-analyses-changed", onChange);
      supabase.removeChannel(ch);
    };
  }, [q]);

  return (
    <section className="panel p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <History className="text-neon-cyan" size={22} />
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex-1">
          Saved Log Analyses <span className="text-muted-foreground font-normal text-base">({rows.length})</span>
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search saved logs..."
            className="pl-8 pr-3 py-2 w-64 bg-background/60 border border-panel-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/60"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading history...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved analyses yet. Analyze a log above to add one.</p>
      ) : (
        <ul className="divide-y divide-panel-border">
          {rows.map((r) => (
            <li key={r.id} className="py-3">
              <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex items-center gap-3 text-left">
                <span className={`text-xs font-bold uppercase w-16 ${severityColor[r.severity as keyof typeof severityColor] ?? ""}`}>
                  {r.severity}
                </span>
                <span className="flex-1 truncate">
                  {r.title} <span className="text-muted-foreground">· {r.category} · {r.ioc_count} IOC(s)</span>
                  {r.novel && <span className="ml-2 text-xs text-neon-red font-semibold">NEW</span>}
                </span>
                <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                {open === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {open === r.id && (
                <pre className="mt-2 p-3 bg-background/60 border border-panel-border rounded text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto">
                  {r.raw_log}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
