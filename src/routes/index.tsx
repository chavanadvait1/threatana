import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/threat/StatCard";
import { SeverityChart } from "@/components/threat/SeverityChart";
import { LogAnalyzer } from "@/components/threat/LogAnalyzer";
import { ThreatList } from "@/components/threat/ThreatList";
import { ThreatChatbot } from "@/components/threat/ThreatChatbot";
import { useThreatStore, setFilter, type ListFilter } from "@/lib/threat-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Cyber Threat Intelligence Platform" },
      {
        name: "description",
        content:
          "Enterprise Security Operations Center dashboard with AI-powered threat detection, log analysis and incident response.",
      },
      { property: "og:title", content: "AI Cyber Threat Intelligence Platform" },
      {
        property: "og:description",
        content: "Enterprise Security Operations Center dashboard with AI-powered threat detection, log analysis and incident response.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { threats, filter } = useThreatStore();
  const total = threats.length;
  const critical = threats.filter((t) => t.severity === "critical" && !t.resolved).length;
  const resolved = threats.filter((t) => t.resolved).length;

  const go = (f: ListFilter) => {
    setFilter(f);
    document.getElementById("threat-list")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl border border-neon-blue/40 bg-neon-blue/10 shadow-[0_0_24px_oklch(0.70_0.22_250/0.25)]">
            <ShieldCheck className="text-neon-blue" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neon-blue text-glow-blue">
              Cybersecurity Threat Analyzer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI Cyber Threat Intelligence Platform · Real-time SOC monitoring
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Threats Detected" value={total} accent="blue" onClick={() => go("all")} active={filter === "all"} />
          <StatCard label="Critical Alerts (open)" value={critical} accent="red" onClick={() => go("critical")} active={filter === "critical"} />
          <StatCard label="Threats Resolved" value={resolved} accent="green" onClick={() => go("resolved")} active={filter === "resolved"} />
          <SeverityChart />
        </section>

        {/* Analyzer */}
        <LogAnalyzer />

        {/* Assistant */}
        <ThreatChatbot />

        {/* Threat list */}
        <ThreatList />

        <footer className="pt-4 pb-2 text-center text-xs text-muted-foreground font-mono">
          &gt; SOC v2.6 · Llama 3 · Realtime feed connected
        </footer>
      </div>
    </div>
  );
}
