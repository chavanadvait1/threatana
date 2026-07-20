import { useMemo, useState } from "react";
import { THREATS, type Severity } from "@/lib/threat-data";
import { ThreatCard } from "./ThreatCard";

const FILTERS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function ThreatList() {
  const [filter, setFilter] = useState<Severity | "all">("all");
  const list = useMemo(
    () => (filter === "all" ? THREATS : THREATS.filter((t) => t.severity === filter)),
    [filter]
  );

  return (
    <section className="panel p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Detected Threats{" "}
          <span className="text-muted-foreground font-normal">({THREATS.length})</span>
        </h2>
        <div className="flex items-center gap-1 rounded-lg border border-panel-border bg-background/40 p-1">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-md transition ${
                  active
                    ? "bg-neon-blue/25 text-neon-blue shadow-[0_0_16px_oklch(0.70_0.22_250/0.35)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => (
          <ThreatCard key={t.id} threat={t} />
        ))}
      </div>
    </section>
  );
}
