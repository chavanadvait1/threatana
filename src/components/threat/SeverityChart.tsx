import { THREATS, type Severity } from "@/lib/threat-data";

const buckets: { key: Severity; label: string; color: string }[] = [
  { key: "critical", label: "Critical", color: "var(--neon-red)" },
  { key: "high", label: "High", color: "var(--neon-amber)" },
  { key: "medium", label: "Medium", color: "var(--neon-cyan)" },
  { key: "low", label: "Low", color: "var(--neon-green)" },
];

export function SeverityChart() {
  const counts = buckets.map((b) => ({
    ...b,
    n: THREATS.filter((t) => t.severity === b.key).length,
  }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <div className="panel neon-border-blue p-6 min-h-[160px]">
      <div className="text-xs tracking-[0.15em] text-muted-foreground uppercase text-center mb-4">
        Severity Distribution
      </div>
      <div className="flex items-end justify-around gap-3 h-20">
        {counts.map((c) => (
          <div key={c.key} className="flex flex-col items-center gap-2 flex-1">
            <div className="flex-1 w-full flex items-end">
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${(c.n / max) * 100}%`,
                  background: `linear-gradient(180deg, ${c.color}, color-mix(in oklab, ${c.color} 40%, transparent))`,
                  boxShadow: `0 0 12px color-mix(in oklab, ${c.color} 50%, transparent)`,
                }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
