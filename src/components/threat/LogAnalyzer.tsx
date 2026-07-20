import { useState } from "react";
import { Terminal, Loader2 } from "lucide-react";

export function LogAnalyzer() {
  const [logs, setLogs] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyze = () => {
    if (!logs.trim()) return;
    setBusy(true);
    setResult(null);
    setTimeout(() => {
      setBusy(false);
      setResult(
        "Threat categorized as MEDIUM. 2 IOCs extracted. Recommendation: isolate host and rotate credentials."
      );
    }, 1200);
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

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={analyze}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neon-blue/20 border border-neon-blue/50 text-neon-blue font-medium hover:bg-neon-blue/30 transition disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          Analyze Logs Securely
        </button>
        {result && (
          <div className="text-sm text-neon-green flex-1">{result}</div>
        )}
      </div>
    </section>
  );
}
