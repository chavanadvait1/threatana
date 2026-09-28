import { useState } from "react";
import { Terminal, Loader2 } from "lucide-react";
import { analyzeLogs, setFilter, type AnalysisResult } from "@/lib/threat-store";
import { severityColor } from "@/lib/threat-data";
import { supabase } from "@/integrations/supabase/client";

const SAMPLE =
  "Sep 26 10:12:01 web01 sshd[2231]: Failed password for invalid user admin from 45.83.66.12 port 51122 ssh2\nSep 26 10:12:04 web01 sshd[2231]: Failed password for invalid user admin from 45.83.66.12 port 51123 ssh2";

export function LogAnalyzer() {
  const [logs, setLogs] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = () => {
    if (!logs.trim()) return;
    setBusy(true);
    setResult(null);
    const raw = logs;
    setTimeout(() => {
      const r = analyzeLogs(raw);
      setResult(r);
      setBusy(false);
      setLogs("");
      setFilter("all");
      supabase
        .from("log_analyses")
        .insert({
          raw_log: raw.slice(0, 20000),
          title: r.threat.description.slice(0, 200),
          category: r.category,
          severity: r.threat.severity,
          novel: !!r.threat.novel,
          ioc_count: r.threat.indicators.length,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to save analysis", error);
          else window.dispatchEvent(new Event("log-analyses-changed"));
        });
    }, 900);
  };

  return (
    <section className="panel p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <Terminal className="text-neon-cyan" size={22} />
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          Analyze Security Logs{" "}
          <span className="text-muted-foreground font-normal text-base">(Llama 3 Powered)</span>
        </h2>
      </div>

      <textarea
        value={logs}
        onChange={(e) => setLogs(e.target.value)}
        placeholder={"Paste security logs here (syslog, access logs, IDS alerts)...\nWe'll intelligently extract the threat and categorize it!"}
        className="w-full h-40 bg-background/60 border border-panel-border rounded-md p-4 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-neon-blue/60 resize-y"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={analyze}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neon-blue/20 border border-neon-blue/50 text-neon-blue font-medium hover:bg-neon-blue/30 transition disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          Analyze Logs Securely
        </button>
        <button
          onClick={() => setLogs(SAMPLE)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Use sample log
        </button>
        {result && (
          <div className="text-sm flex-1">
            Ticket <span className="font-mono">#{result.threat.id}</span> created ·{" "}
            <span className={`font-semibold uppercase ${severityColor[result.threat.severity]}`}>
              {result.threat.severity}
            </span>{" "}
            · {result.category} · {result.threat.indicators.length} IOC(s) extracted
          </div>
        )}
      </div>
    </section>
  );
}
