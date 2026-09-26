import { useMemo } from "react";
import { useThreatStore, setFilter, type ListFilter } from "@/lib/threat-store";
import { ThreatCard } from "./ThreatCard";

const FILTERS: ListFilter[] = ["all", "new", "critical", "high", "medium", "low", "resolved"];

export function ThreatList() {
  const { threats, filter } = useThreatStore();
  const list = useMemo(() => {
    if (filter === "all") return threats;
    if (filter === "resolved") return threats.filter((t) => t.resolved);
    if (filter === "new") return threats.filter((t) => t.isNew);
    return threats.filter((t) => t.severity === filter);
  }, [threats, filter]);

  return (
    <section id="threat-list" className="panel p-6 md:p-8 scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Detected Threats{" "}
          <span className="text-muted-foreground font-normal">({list.length})</span>
        </h2>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-panel-border bg-background/40 p-1">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-md transition ${
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

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No threats in this view.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => (
            <ThreatCard key={t.id} threat={t} />
          ))}
        </div>
      )}
    </section>
  );
}
