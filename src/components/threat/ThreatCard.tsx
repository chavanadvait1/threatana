import { Clock, Globe, Lock, User, Hash, CheckCircle2, Github } from "lucide-react";
import { useState } from "react";
import { severityBorder, severityColor, type Threat } from "@/lib/threat-data";

const iocIcon = { ip: Globe, file: Lock, hash: Hash, user: User } as const;

export function ThreatCard({ threat }: { threat: Threat }) {
  const [resolved, setResolved] = useState(!!threat.resolved);
  const label = `${threat.severity.toUpperCase()} ALERT`;

  return (
    <article
      className={`panel ${severityBorder[threat.severity]} p-5 flex flex-col gap-4 transition ${
        resolved ? "opacity-60" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className={`text-lg font-bold tracking-wide ${severityColor[threat.severity]}`}>
          {label}
        </h3>
        <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded border border-panel-border">
          [{threat.id}]
        </span>
      </header>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={12} />
        <span className="font-mono">{threat.timestamp}</span>
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">{threat.description}</p>

      <div className="rounded-md bg-background/50 border border-panel-border p-3">
        <div className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2">
          Indicators of Compromise:
        </div>
        <ul className="space-y-1">
          {threat.indicators.map((i, idx) => {
            const Icon = iocIcon[i.type];
            return (
              <li key={idx} className="flex items-center gap-2 text-xs font-mono text-foreground/80">
                <Icon size={12} className="text-neon-cyan" />
                {i.value}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button className="inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-neon-blue/10 border border-neon-blue/40 text-neon-blue text-sm font-semibold hover:bg-neon-blue/20 transition">
          <Github size={14} />
          Create GitHub Ticket
        </button>
        <button
          onClick={() => setResolved((r) => !r)}
          className="inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-neon-green/10 border border-neon-green/40 text-neon-green text-sm font-semibold hover:bg-neon-green/20 transition"
        >
          <CheckCircle2 size={14} />
          {resolved ? "Resolved" : "Resolve"}
        </button>
      </div>
    </article>
  );
}
