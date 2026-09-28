import {
  Clock,
  Globe,
  Lock,
  User,
  Hash,
  CheckCircle2,
  Github,
  Wrench,
  LifeBuoy,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import { severityBorder, severityColor, type Threat } from "@/lib/threat-data";
import { resolvePlaybook } from "@/lib/remediation";
import { toggleResolved } from "@/lib/threat-store";
import { createGithubTicket } from "@/lib/github.functions";

const iocIcon = { ip: Globe, file: Lock, hash: Hash, user: User } as const;

export function ThreatCard({ threat }: { threat: Threat }) {
  const resolved = !!threat.resolved;
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);

  const createTicket = async () => {
    if (creating) return;
    if (ticketUrl) {
      window.open(ticketUrl, "_blank", "noopener");
      return;
    }
    setCreating(true);
    try {
      const issue = await createGithubTicket({
        data: {
          threatId: threat.id,
          severity: threat.severity,
          description: threat.description,
          indicators: threat.indicators.map((i) => i.value),
          timestamp: threat.timestamp,
        },
      });
      setTicketUrl(issue.url);
      window.open(issue.url, "_blank", "noopener");
    } catch (e) {
      console.error(e);
      alert("Could not create the GitHub ticket. Check the GitHub connection and try again.");
    } finally {
      setCreating(false);
    }
  };
  const label = threat.novel ? "NEW THREAT" : `${threat.severity.toUpperCase()} ALERT`;
  const isLow = threat.severity === "low";

  const playbook = resolvePlaybook(
    `${threat.description} ${threat.indicators.map((i) => i.value).join(" ")}`,
    threat.severity
  );

  const askAssistant = () => {
    window.dispatchEvent(
      new CustomEvent("soc-assistant-ask", {
        detail: `Threat #${threat.id} (${threat.severity}): ${threat.description}`,
      })
    );
  };

  return (
    <article
      className={`panel ${threat.novel ? "neon-border-red" : severityBorder[threat.severity]} p-5 flex flex-col gap-4 transition ${
        resolved ? "opacity-60" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className={`text-lg font-bold tracking-wide flex items-center gap-2 ${threat.novel ? "text-neon-red" : severityColor[threat.severity]}`}>
          {threat.novel && <AlertTriangle size={18} className="animate-pulse" />}
          {label}
        </h3>
        <div className="flex items-center gap-2">
          {threat.isNew && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-neon-red/20 border border-neon-red/60 text-neon-red animate-pulse">
              <Sparkles size={10} /> NEW
            </span>
          )}
          {threat.novel && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-neon-amber/20 border border-neon-amber/60 text-neon-amber">
              HIGH PRIORITY
            </span>
          )}
          <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded border border-panel-border">
            [{threat.id}]
          </span>
        </div>
      </header>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={12} />
        <span className="font-mono">{threat.timestamp}</span>
        {resolved && <span className="ml-auto text-neon-green font-semibold">RESOLVED</span>}
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

      {/* Solve / help */}
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition ${
            isLow
              ? "bg-neon-green/15 border border-neon-green/50 text-neon-green hover:bg-neon-green/25"
              : "bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/20"
          }`}
        >
          {isLow ? <Wrench size={14} /> : <LifeBuoy size={14} />}
          {isLow ? "Solve This Threat" : "Suggestions & Help"}
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-3 rounded-md bg-background/60 border border-panel-border p-4 space-y-3">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">
                Solution Metric
              </div>
              <p className="text-sm text-neon-cyan font-semibold">{playbook.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{playbook.plain}</p>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-2">
                Remediation Steps
              </div>
              <ol className="space-y-2">
                {playbook.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/85 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full border border-panel-border grid place-items-center font-mono text-[10px] text-neon-blue">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={askAssistant}
              className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-md border border-neon-blue/40 bg-neon-blue/10 text-neon-blue text-xs font-semibold hover:bg-neon-blue/20 transition"
            >
              <MessageSquare size={13} />
              Take help from SOC Assistant
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={createTicket}
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-neon-blue/10 border border-neon-blue/40 text-neon-blue text-sm font-semibold hover:bg-neon-blue/20 transition disabled:opacity-50"
        >
          <Github size={14} />
          {creating ? "Creating..." : ticketUrl ? "Open GitHub Ticket" : "Create GitHub Ticket"}
        </button>
        <button
          onClick={() => toggleResolved(threat.id)}
          className="inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-neon-green/10 border border-neon-green/40 text-neon-green text-sm font-semibold hover:bg-neon-green/20 transition"
        >
          <CheckCircle2 size={14} />
          {resolved ? "Resolved" : "Resolve"}
        </button>
      </div>
    </article>
  );
}
