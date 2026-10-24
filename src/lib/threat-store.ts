import { useSyncExternalStore } from "react";
import { THREATS, type Severity, type Threat } from "./threat-data";
import { setThreatResolved } from "./resolution.functions";

export type ListFilter = Severity | "all" | "new" | "resolved";

type State = { threats: Threat[]; filter: ListFilter };

let state: State = { threats: THREATS.map((t) => ({ ...t, key: `seed-${t.id}` })), filter: "all" };
const listeners = new Set<() => void>();
const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  listeners.forEach((l) => l());
};

export function useThreatStore() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
    () => state
  );
}

export const setFilter = (filter: ListFilter) => set({ filter });

export const toggleResolved = (id: number) => {
  const t = state.threats.find((x) => x.id === id);
  if (!t) return;
  const resolved = !t.resolved;
  set({ threats: state.threats.map((x) => (x.id === id ? { ...x, resolved } : x)) });
  if (t.key)
    setThreatResolved({ data: { threatKey: t.key, resolved } }).catch((e) =>
      console.error("Failed to save resolution", e)
    );
};

let loaded = false;
/** Load saved tickets and resolved marks from the database (once, in the browser). */
export async function loadPersisted() {
  if (loaded) return;
  loaded = true;
  const [{ data: rows }, { data: res }] = await Promise.all([
    supabase.from("log_analyses").select("*").order("created_at", { ascending: true }).limit(500),
    supabase.from("threat_resolutions").select("*"),
  ]);
  const resolvedMap = new Map((res ?? []).map((r) => [r.threat_key, r.resolved]));
  const seeds = THREATS.map((t) => ({ ...t, key: `seed-${t.id}` }));
  let next = Math.max(...seeds.map((t) => t.id));
  const saved: Threat[] = (rows ?? []).map((r) => ({
    id: ++next,
    key: `db-${r.id}`,
    severity: r.severity as Severity,
    timestamp: new Date(r.created_at).toLocaleString(),
    description: r.description ?? r.title,
    indicators: Array.isArray(r.indicators) && r.indicators.length
      ? (r.indicators as Threat["indicators"])
      : [{ type: "file", value: "no IOC extracted" }],
    novel: r.novel,
    category: r.category,
    isNew: Date.now() - new Date(r.created_at).getTime() < 15 * 60 * 1000,
  }));
  const all = [...saved.reverse(), ...seeds].map((t) => ({
    ...t,
    resolved: resolvedMap.get(t.key!) ?? false,
  }));
  set({ threats: all });
}

export function addThreat(t: Omit<Threat, "id">): Threat {
  const id = Math.max(0, ...state.threats.map((x) => x.id)) + 1;
  const threat = { ...t, id };
  set({ threats: [threat, ...state.threats] });
  return threat;
}

// ---- Rule-based log analysis (frontend placeholder for the AI engine) ----
const RULES: { re: RegExp; severity: Severity; category: string; text: string }[] = [
  { re: /ransom|wannacry|encrypt(ed|ing)|\.locked|tasksche/i, severity: "critical", category: "Ransomware", text: "Ransomware-like file activity detected; files may be getting encrypted." },
  { re: /hash mismatch|integrity|tamper/i, severity: "critical", category: "System Tampering", text: "A system file integrity check failed, indicating possible tampering or malware." },
  { re: /privilege|escalat|sudo.*(fail|denied)|cve-\d+/i, severity: "critical", category: "Privilege Escalation", text: "Privilege escalation attempt detected on a host." },
  { re: /accepted (password|publickey) for root|root login|unauthori[sz]ed (login|access)/i, severity: "critical", category: "Unauthorized Access", text: "An unauthorized or privileged login succeeded, indicating possible account compromise." },
  { re: /powershell|-enc|cobalt|mimikatz/i, severity: "high", category: "Malicious Execution", text: "Suspicious script/tool execution consistent with attacker tooling." },
  { re: /lateral|smb|psexec|wmi/i, severity: "high", category: "Lateral Movement", text: "Lateral movement between internal hosts detected." },
  { re: /upload|webshell|\.php|\.jsp/i, severity: "high", category: "Malicious Upload", text: "An unexpected file upload was detected that may contain malicious content." },
  { re: /c2|beacon|port 4444|command and control/i, severity: "medium", category: "C2 Beaconing", text: "Outbound traffic resembling command-and-control beaconing was observed." },
  { re: /exfil|gb uploaded|large transfer|dns tunnel/i, severity: "medium", category: "Data Exfiltration", text: "An anomalous data transfer pattern suggests possible exfiltration." },
  { re: /failed password|authentication fail|invalid user|brute/i, severity: "low", category: "Brute Force", text: "Repeated failed login attempts suggest a brute force attempt." },
  { re: /port scan|nmap|syn scan|masscan/i, severity: "low", category: "Reconnaissance", text: "Port scanning / reconnaissance activity detected." },
];

function extractIocs(logs: string): Threat["indicators"] {
  const out: Threat["indicators"] = [];
  const add = (type: Threat["indicators"][number]["type"], v: string) => {
    if (!out.some((o) => o.value === v) && out.length < 5) out.push({ type, value: v });
  };
  logs.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)?.forEach((v) => add("ip", v));
  logs.match(/\b[a-f0-9]{32,64}\b/gi)?.forEach((v) => add("hash", v.slice(0, 16) + "..."));
  logs.match(/\b[\w.-]+\.(exe|dll|sys|ps1|sh|php|jsp|bat)\b/gi)?.forEach((v) => add("file", v));
  for (const m of logs.matchAll(/(?:user[=: ]+|for (?:invalid user )?)'?([a-z_][\w.-]*)/gi)) add("user", m[1]);
  return out;
}

export interface AnalysisResult {
  threat: Threat;
  category: string;
}

export type Classified = Omit<Threat, "id" | "timestamp">;

/** Rule-based fallback classifier. */
export function classifyRules(logs: string): Classified {
  const matches = RULES.filter((r) => r.re.test(logs));
  const order: Severity[] = ["critical", "high", "medium", "low"];
  matches.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  const top = matches[0];
  const failed = (logs.match(/failed|invalid/gi) || []).length;

  let severity: Severity;
  let category: string;
  let description: string;
  let novel = false;
  if (!top) {
    severity = "high";
    category = "New Threat";
    novel = true;
    description =
      "Unrecognized suspicious pattern — no known signature matched. Treated as a NEW threat with high priority for analyst review.";
  } else {
    severity = top.severity;
    // escalate brute force when very frequent
    if (top.category === "Brute Force" && failed >= 10) severity = "medium";
    category = matches.map((m) => m.category).filter((v, i, a) => a.indexOf(v) === i).join(" + ");
    description = top.text + (matches.length > 1 ? ` Also observed: ${matches.slice(1).map((m) => m.category).join(", ")}.` : "");
  }

  return {
    severity,
    description: `[${category}] ${description}`,
    indicators: extractIocs(logs).length ? extractIocs(logs) : [{ type: "file", value: "no IOC extracted" }],
    isNew: true,
    novel,
    category,
  };
}

/** Add a classified result as a new ticket, persisting it so it survives refresh. */
export async function createTicket(raw: string, c: Classified): Promise<AnalysisResult> {
  const id = crypto.randomUUID();
  const threat = addThreat({ ...c, key: `db-${id}`, timestamp: new Date().toLocaleString() });
  const { error } = await supabase.from("log_analyses").insert({
    id,
    raw_log: raw.slice(0, 20000),
    title: c.description.slice(0, 200),
    description: c.description.slice(0, 2000),
    category: (c.category ?? "Unknown").slice(0, 100),
    severity: c.severity,
    novel: !!c.novel,
    ioc_count: c.indicators.length,
    indicators: c.indicators,
  });
  if (error) console.error("Failed to save analysis", error);
  return { threat, category: c.category ?? "Unknown" };
}
