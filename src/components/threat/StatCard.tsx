import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  accent: "blue" | "red" | "green" | "amber";
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const accentMap = {
  blue: { border: "neon-border-blue", text: "text-neon-blue text-glow-blue" },
  red: { border: "neon-border-red", text: "text-neon-red text-glow-red" },
  green: { border: "neon-border-green", text: "text-neon-green text-glow-green" },
  amber: { border: "neon-border-amber", text: "text-neon-amber" },
};

export function StatCard({ label, value, accent, icon, onClick, active }: Props) {
  const a = accentMap[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`panel ${a.border} p-6 flex flex-col items-center justify-center min-h-[160px] w-full transition hover:-translate-y-0.5 ${
        active ? "ring-2 ring-foreground/30" : ""
      }`}
    >
      {icon && <div className="mb-2 opacity-70">{icon}</div>}
      <div className={`text-5xl font-bold tabular-nums ${a.text}`}>{value}</div>
      <div className="mt-3 text-xs tracking-[0.15em] text-muted-foreground uppercase text-center">
        {label}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground/60">Click to view</div>
    </button>
  );
}
