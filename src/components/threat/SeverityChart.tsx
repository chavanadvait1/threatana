import { useThreatStore, setFilter, type ListFilter } from "@/lib/threat-store";
import type { Threat } from "@/lib/threat-data";

const buckets: { key: ListFilter; label: string; color: string; test: (t: Threat) => boolean }[] = [
  { key: "new", label: "New", color: "var(--neon-red)", test: (t) => !!t.isNew },
  { key: "critical", label: "Critical", color: "var(--neon-red)", test: (t) => t.severity === "critical" },
  { key: "high", label: "High", color: "var(--neon-amber)", test: (t) => t.severity === "high" },
  { key: "medium", label: "Medium", color: "var(--neon-cyan)", test: (t) => t.severity === "medium" },
  { key: "low", label: "Low", color: "var(--neon-green)", test: (t) => t.severity === "low" },
];

export function SeverityChart() {
  const { threats } = useThreatStore();
  const open = threats.filter((t) => !t.resolved);
  const counts = buckets.map((b) => ({ ...b, n: open.filter(b.test).length }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <div className="panel neon-border-blue p-5 min-h-[160px]">
      <div className="text-xs tracking-[0.15em] text-muted-foreground uppercase text-center mb-3">
        Severity Distribution (open)
      </div>
      <div className="flex items-end justify-around gap-2 h-24">
        {counts.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setFilter(c.key);
              document.getElementById("threat-list")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-1 flex-1 h-full"
          >
            <div className="text-[10px] font-mono text-foreground/80">{c.n}</div>
            <div className="flex-1 w-full flex items-end">
              <div
                className={`w-full rounded-sm transition-all duration-500 ${c.key === "new" && c.n > 0 ? "animate-pulse" : ""}`}
                style={{
                  height: `${Math.max((c.n / max) * 100, 4)}%`,
                  background: `linear-gradient(180deg, ${c.color}, color-mix(in oklab, ${c.color} 40%, transparent))`,
                  boxShadow: `0 0 12px color-mix(in oklab, ${c.color} 50%, transparent)`,
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">{c.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
