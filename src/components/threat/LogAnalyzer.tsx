import { useState } from "react";
import { Terminal, Loader2, Shuffle } from "lucide-react";
import { classifyRules, createTicket, setFilter, type AnalysisResult } from "@/lib/threat-store";
import { severityColor } from "@/lib/threat-data";
import { analyzeLogsAI } from "@/lib/analyze.functions";
import { randomSampleLog } from "@/lib/sample-logs";

export function LogAnalyzer() {
  const [logs, setLogs] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [engine, setEngine] = useState<"ai" | "rules" | null>(null);

  const analyze = async () => {
    const raw = logs.trim();
    if (!raw) return;
    setBusy(true);
    setResult(null);
    let ai = null;
    try {
      ai = await analyzeLogsAI({ data: { logs: raw.slice(0, 20000) } });
    } catch (e) {
      console.error(e);
    }
    const c = ai
      ? {
          severity: ai.severity,
          category: ai.category,
          description: `[${ai.category}] ${ai.description}`,
          novel: ai.novel,
          isNew: true,
          indicators: ai.indicators.length ? ai.indicators.slice(0, 8) : [{ type: "file" as const, value: "no IOC extracted" }],
        }
      : classifyRules(raw);
    const r = await createTicket(raw, c);
    setEngine(ai ? "ai" : "rules");
    setResult(r);
    setBusy(false);
    setLogs("");
    setFilter("all");
  };

  return (
    <section className="panel p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <Terminal className="text-neon-cyan" size={22} />
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          Analyze Security Logs{" "}
          <span className="text-muted-foreground font-normal text-base">(AI Powered)</span>
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
          {busy ? "Analyzing..." : "Analyze Logs Securely"}
        </button>
        <button
          onClick={() => setLogs(randomSampleLog())}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline"
        >
          <Shuffle size={12} /> Use random sample log
        </button>
        {result && (
          <div className="text-sm flex-1">
            Ticket <span className="font-mono">#{result.threat.id}</span> created ·{" "}
            <span className={`font-semibold uppercase ${severityColor[result.threat.severity]}`}>
              {result.threat.severity}
            </span>{" "}
            · {result.category} · {result.threat.indicators.length} IOC(s) extracted
            <span className="text-muted-foreground"> · {engine === "ai" ? "AI analysis" : "rule-based fallback"}</span>
          </div>
        )}
      </div>
    </section>
  );
}
